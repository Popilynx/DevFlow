-- =====================================================
-- DEVFLOW - TESTE DO FLUXO DE CONFIRMAÇÃO DE EMAIL
-- Execute este script para verificar se tudo está funcionando
-- =====================================================

-- 1. Verificar se a tabela email_confirmations existe
SELECT 'Verificando tabela email_confirmations...' as status;

SELECT 
  table_name,
  CASE 
    WHEN table_name = 'email_confirmations' THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'email_confirmations';

-- 2. Verificar estrutura da tabela
SELECT 'Verificando estrutura da tabela...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name IN ('id', 'user_id', 'email', 'token', 'created_at', 'confirmed') THEN '✅ OK'
    ELSE '❌ FALTANDO'
  END as check_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'email_confirmations'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT 'Verificando RLS...' as status;

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ HABILITADO'
    ELSE '❌ DESABILITADO'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'email_confirmations';

-- 4. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as status;

SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ CRIADA'
    ELSE '❌ FALTANDO'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'email_confirmations'
ORDER BY policyname;

-- 5. Verificar índices
SELECT 'Verificando índices...' as status;

SELECT 
  indexname,
  CASE 
    WHEN indexname LIKE 'idx_email_confirmations_%' THEN '✅ CRIADO'
    ELSE '❌ FALTANDO'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'email_confirmations'
ORDER BY indexname;

-- 6. Teste de inserção (simulação)
SELECT 'Teste de inserção (simulação)...' as status;

-- Simular inserção de um token de confirmação
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000000';
  test_email TEXT := 'test@example.com';
  test_token TEXT := 'test-token-123';
BEGIN
  -- Tentar inserir um registro de teste
  INSERT INTO public.email_confirmations (user_id, email, token)
  VALUES (test_user_id, test_email, test_token);
  
  RAISE NOTICE '✅ Inserção de teste bem-sucedida';
  
  -- Limpar o teste
  DELETE FROM public.email_confirmations WHERE token = test_token;
  
  RAISE NOTICE '✅ Limpeza de teste bem-sucedida';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;

-- 7. Resumo final
SELECT 'RESUMO DO TESTE' as section;

SELECT 
  'Tabela email_confirmations' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'email_confirmations'
    ) THEN '✅ FUNCIONANDO'
    ELSE '❌ PROBLEMA'
  END as status

UNION ALL

SELECT 
  'RLS habilitado' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'email_confirmations' 
      AND rowsecurity = true
    ) THEN '✅ FUNCIONANDO'
    ELSE '❌ PROBLEMA'
  END as status

UNION ALL

SELECT 
  'Políticas RLS' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'email_confirmations'
    ) THEN '✅ FUNCIONANDO'
    ELSE '❌ PROBLEMA'
  END as status

UNION ALL

SELECT 
  'Índices criados' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'email_confirmations'
      AND indexname LIKE 'idx_email_confirmations_%'
    ) THEN '✅ FUNCIONANDO'
    ELSE '❌ PROBLEMA'
  END as status;

-- 8. Instruções finais
SELECT 'INSTRUÇÕES FINAIS' as section;

SELECT 
  '🎉 Se todos os itens acima estão ✅ FUNCIONANDO, o fluxo de confirmação está pronto!' as message

UNION ALL

SELECT 
  '📧 Teste o cadastro de um novo usuário e verifique se o e-mail é enviado' as message

UNION ALL

SELECT 
  '🔗 Teste a confirmação do token na tela /confirmacao' as message

UNION ALL

SELECT 
  '🔐 Teste o login após a confirmação' as message; 