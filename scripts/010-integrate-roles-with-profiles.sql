-- Integrar roles com a tabela profiles
-- Adicionar campo role à tabela profiles existente

-- Adicionar coluna role à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Atualizar trigger para incluir role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.email IN ('renato@example.com', 'admin@devflow.com') THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para atualizar role de usuário
CREATE OR REPLACE FUNCTION update_user_role(user_uuid UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário que está executando é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar roles';
  END IF;

  -- Atualizar role
  UPDATE public.profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = user_uuid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS atualizadas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para admins gerenciarem outros perfis
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Migrar dados existentes (se houver)
-- Se existir tabela user_roles, migrar dados para profiles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    UPDATE public.profiles 
    SET role = ur.role
    FROM public.user_roles ur
    WHERE profiles.id = ur.user_id;
    
    -- Remover tabela user_roles antiga
    DROP TABLE IF EXISTS public.user_roles;
  END IF;
END $$;

-- Comentários
COMMENT ON COLUMN public.profiles.role IS 'Role do usuário: admin ou user';
COMMENT ON FUNCTION update_user_role IS 'Função para atualizar role de usuário (apenas admins)';
COMMENT ON FUNCTION get_current_user_role IS 'Função para obter role do usuário atual'; 