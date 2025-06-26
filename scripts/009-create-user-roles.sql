-- Criar tabela de roles de usuário
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_roles
-- Usuários podem ver apenas seu próprio role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Apenas admins podem inserir/atualizar roles
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON user_roles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir role padrão para usuários existentes (se necessário)
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'user' FROM auth.users 
-- WHERE id NOT IN (SELECT user_id FROM user_roles);

-- Comentários
COMMENT ON TABLE user_roles IS 'Tabela para gerenciar roles de usuário (admin/user)';
COMMENT ON COLUMN user_roles.user_id IS 'ID do usuário do Supabase Auth';
COMMENT ON COLUMN user_roles.role IS 'Role do usuário: admin ou user'; 