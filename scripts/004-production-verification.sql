-- =====================================================
-- DEVFLOW - VERIFICAÇÃO FINAL PARA PRODUÇÃO
-- Execute este script para verificar se tudo está funcionando
-- =====================================================

-- 1. Verificar se todas as tabelas foram criadas
SELECT 'Verificando tabelas...' as status;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings') 
    THEN '✅ OK'
    ELSE '❌ FALTANDO'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY table_name;

-- 2. Verificar se RLS está habilitado
SELECT 'Verificando RLS...' as status;

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ HABILITADO'
    ELSE '❌ DESABILITADO'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY tablename;

-- 3. Verificar se as políticas RLS foram criadas
SELECT 'Verificando políticas RLS...' as status;

SELECT 
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'SELECT' THEN 'SELECT'
    WHEN cmd = 'INSERT' THEN 'INSERT'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
    WHEN cmd = 'ALL' THEN 'ALL'
    ELSE cmd
  END as operation
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY tablename, policyname;

-- 4. Verificar se as funções foram criadas
SELECT 'Verificando funções...' as status;

SELECT 
  routine_name,
  CASE 
    WHEN routine_name IN ('update_updated_at_column', 'is_admin_user', 'handle_new_user', 'update_user_role', 'get_current_user_role') 
    THEN '✅ CRIADA'
    ELSE '❌ FALTANDO'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_updated_at_column', 'is_admin_user', 'handle_new_user', 'update_user_role', 'get_current_user_role')
ORDER BY routine_name;

-- 5. Verificar se os triggers foram criados
SELECT 'Verificando triggers...' as status;

SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  CASE 
    WHEN trigger_name LIKE '%updated_at%' OR trigger_name = 'on_auth_user_created'
    THEN '✅ CRIADO'
    ELSE '❌ FALTANDO'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND (trigger_name LIKE '%updated_at%' OR trigger_name = 'on_auth_user_created')
ORDER BY trigger_name;

-- 6. Verificar se os índices foram criados
SELECT 'Verificando índices...' as status;

SELECT 
  indexname,
  tablename,
  CASE 
    WHEN indexname LIKE 'idx_%' THEN '✅ CRIADO'
    ELSE '❌ FALTANDO'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 7. Verificar estrutura da tabela profiles (incluindo role)
SELECT 'Verificando estrutura da tabela profiles...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'role' THEN '✅ PRESENTE'
    ELSE 'OK'
  END as role_check
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 8. Testar função is_admin_user (deve retornar false se não estiver logado)
SELECT 'Testando função is_admin_user...' as status;

SELECT 
  'is_admin_user()' as function,
  CASE 
    WHEN public.is_admin_user() IS NOT NULL THEN '✅ FUNCIONANDO'
    ELSE '❌ ERRO'
  END as status,
  public.is_admin_user() as result;

-- 9. Resumo final
SELECT 'RESUMO FINAL' as section;

SELECT 
  'Tabelas criadas' as item,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ COMPLETO'
    ELSE '❌ INCOMPLETO'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')

UNION ALL

SELECT 
  'Políticas RLS' as item,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✅ COMPLETO'
    ELSE '❌ INCOMPLETO'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')

UNION ALL

SELECT 
  'Funções criadas' as item,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ COMPLETO'
    ELSE '❌ INCOMPLETO'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_updated_at_column', 'is_admin_user', 'handle_new_user', 'update_user_role', 'get_current_user_role')

UNION ALL

SELECT 
  'Triggers criados' as item,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ COMPLETO'
    ELSE '❌ INCOMPLETO'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND (trigger_name LIKE '%updated_at%' OR trigger_name = 'on_auth_user_created');

-- 10. Instruções finais
SELECT 'INSTRUÇÕES FINAIS' as section;

SELECT 
  '🎉 Se todos os itens acima estão ✅ COMPLETO, seu banco está pronto para produção!' as message

UNION ALL

SELECT 
  '📧 Configure a confirmação de email no Supabase Dashboard > Authentication > Settings' as message

UNION ALL

SELECT 
  '🔗 Configure as URLs de redirecionamento no Supabase Dashboard > Authentication > URL Configuration' as message

UNION ALL

SELECT 
  '🚀 Seu DevFlow está pronto para deploy no Vercel!' as message; 