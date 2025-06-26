-- Script para corrigir recursão infinita nas políticas RLS
-- Execute este script no Supabase SQL Editor

-- 1. Remover todas as políticas RLS da tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- 2. Criar políticas RLS corrigidas (sem recursão)
-- Política para usuários verem seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para usuários inserirem seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Criar função para verificar se usuário é admin (sem recursão)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o email do usuário está na lista de admins
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('renato@example.com', 'admin@devflow.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar política para admins gerenciarem todos os perfis (sem recursão)
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (is_admin_user());

-- 5. Verificar se o perfil do usuário existe, se não, criar
INSERT INTO public.profiles (
  id,
  name,
  email,
  role,
  bio,
  created_at,
  updated_at
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.email, 'Usuário'),
  u.email,
  CASE 
    WHEN u.email IN ('renato@example.com', 'admin@devflow.com') THEN 'admin'
    ELSE 'user'
  END,
  'Desenvolvedor apaixonado por tecnologia e inovação.',
  u.created_at,
  NOW()
FROM auth.users u
WHERE u.id = '1dad715d-e41c-401f-8c4c-d4120015389a'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 6. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 7. Testar consultas
SELECT 'Teste 1: Consulta de perfil' as teste;
SELECT * FROM public.profiles WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';

SELECT 'Teste 2: Consulta de role' as teste;
SELECT role FROM public.profiles WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';

SELECT 'Teste 3: Verificar se é admin' as teste;
SELECT is_admin_user() as is_admin; 