-- Script para criar manualmente o perfil do usuário
-- Execute este script no Supabase SQL Editor após executar o 011-fix-profiles-table.sql

-- Substitua o UUID abaixo pelo ID do usuário que está causando erro
-- O ID do erro é: 1dad715d-e41c-401f-8c4c-d4120015389a

-- 1. Verificar se o usuário existe no auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';

-- 2. Verificar se já existe perfil para este usuário
SELECT * FROM public.profiles 
WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';

-- 3. Criar perfil se não existir
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

-- 4. Verificar se o perfil foi criado
SELECT 
  p.*,
  u.email as auth_email
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = '1dad715d-e41c-401f-8c4c-d4120015389a';

-- 5. Testar consulta que estava falhando
SELECT role FROM public.profiles 
WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';

-- 6. Verificar todas as políticas RLS na tabela profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 8. Mostrar estrutura completa da tabela
\d public.profiles;

RAISE NOTICE 'Perfil do usuário criado/verificado com sucesso!'; 