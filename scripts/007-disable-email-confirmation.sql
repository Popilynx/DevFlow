-- Script para desabilitar confirmação de email (apenas para desenvolvimento)
-- ATENÇÃO: Use apenas em ambiente de desenvolvimento!

-- Para desabilitar a confirmação de email no Supabase:
-- 1. Vá para o Dashboard do Supabase
-- 2. Authentication > Settings
-- 3. Desmarque "Enable email confirmations"
-- 4. Ou execute este comando se tiver acesso direto ao banco:

-- UPDATE auth.config 
-- SET email_confirm_required = false 
-- WHERE id = 'default';

-- Verificar configuração atual
SELECT 
  'Email Confirmation' as setting,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.config 
      WHERE email_confirm_required = true
    ) THEN 'ENABLED - Users need to confirm email'
    ELSE 'DISABLED - Auto login after registration'
  END as status;

-- Informações sobre configuração
SELECT 
  '⚠️  IMPORTANTE' as notice,
  'Para login automático após registro, desabilite a confirmação de email no Dashboard do Supabase' as instruction,
  'Authentication > Settings > Enable email confirmations = OFF' as path;
