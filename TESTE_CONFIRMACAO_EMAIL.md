# 🧪 Guia de Teste - Confirmação de Email

Este guia vai te ajudar a testar e garantir que o fluxo de confirmação de e-mail está funcionando corretamente.

## 📋 Pré-requisitos

### 1. Variáveis de Ambiente
Certifique-se de que as seguintes variáveis estão configuradas no `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Resend (para envio de e-mails)
RESEND_API_KEY=sua_chave_do_resend

# URL do site (para produção)
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
```

### 2. Banco de Dados
Execute os scripts SQL na ordem correta:

```sql
-- 1. Criação de tabelas
-- Execute: scripts/001-create-tables.sql

-- 2. Habilitar RLS
-- Execute: scripts/002-enable-rls.sql

-- 3. Funções e triggers
-- Execute: scripts/003-create-functions.sql

-- 4. Tabela de confirmação de e-mail
-- Execute: scripts/005-email-confirmations.sql

-- 5. Verificação final
-- Execute: scripts/004-production-verification.sql

-- 6. Teste do fluxo
-- Execute: scripts/test-email-flow.sql
```

## 🧪 Testes a Realizar

### Teste 1: Cadastro de Novo Usuário

1. **Acesse a aplicação** em `http://localhost:3000`
2. **Clique em "Cadastrar"** ou "Registrar"
3. **Preencha os dados:**
   - Nome: `Teste Usuário`
   - Email: `teste@exemplo.com`
   - Senha: `123456`
4. **Clique em "Cadastrar"**
5. **Verifique se:**
   - ✅ Aparece mensagem de sucesso
   - ✅ É redirecionado para `/confirmacao`
   - ✅ Recebe e-mail com token (verifique spam)

### Teste 2: Confirmação do Token

1. **Abra o e-mail** recebido
2. **Copie o token** (código alfanumérico)
3. **Na tela `/confirmacao`:**
   - Cole o token no campo
   - Clique em "Confirmar Email"
4. **Verifique se:**
   - ✅ Aparece mensagem "Email confirmado com sucesso!"
   - ✅ É mostrado botão "Ir para o Login"
   - ✅ Não é redirecionado automaticamente

### Teste 3: Login Após Confirmação

1. **Clique em "Ir para o Login"**
2. **Faça login com:**
   - Email: `teste@exemplo.com`
   - Senha: `123456`
3. **Verifique se:**
   - ✅ Login é bem-sucedido
   - ✅ É redirecionado para o dashboard
   - ✅ Pode acessar todas as funcionalidades

### Teste 4: Bloqueio de Login Sem Confirmação

1. **Cadastre outro usuário:**
   - Nome: `Teste Bloqueio`
   - Email: `bloqueio@exemplo.com`
   - Senha: `123456`
2. **NÃO confirme o e-mail** (não cole o token)
3. **Tente fazer login** com as credenciais
4. **Verifique se:**
   - ✅ Aparece erro: "Confirme seu e-mail antes de acessar"
   - ✅ Login é bloqueado
   - ✅ Não consegue acessar a plataforma

### Teste 5: Token Inválido

1. **Na tela `/confirmacao`**
2. **Cole um token inválido** (ex: `token-falso-123`)
3. **Clique em "Confirmar Email"**
4. **Verifique se:**
   - ✅ Aparece erro: "Token inválido ou expirado"
   - ✅ Não é confirmado
   - ✅ Pode tentar novamente

## 🔍 Verificações no Banco de Dados

### Verificar Tabela de Confirmações

```sql
-- Verificar se a tabela existe
SELECT * FROM information_schema.tables 
WHERE table_name = 'email_confirmations';

-- Verificar registros de confirmação
SELECT 
  email,
  confirmed,
  created_at
FROM email_confirmations 
ORDER BY created_at DESC;
```

### Verificar Usuários

```sql
-- Verificar usuários criados
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;
```

## 🐛 Troubleshooting

### Problema: E-mail não é enviado

**Possíveis causas:**
- ❌ `RESEND_API_KEY` não configurada
- ❌ Domínio não verificado no Resend
- ❌ E-mail na pasta de spam

**Solução:**
1. Verifique as variáveis de ambiente
2. Configure o domínio no Resend
3. Verifique a pasta de spam

### Problema: Token inválido

**Possíveis causas:**
- ❌ Tabela `email_confirmations` não criada
- ❌ Token expirado (mais de 24h)
- ❌ Token já usado

**Solução:**
1. Execute o script `005-email-confirmations.sql`
2. Gere novo token fazendo novo cadastro
3. Verifique se o token não foi usado

### Problema: Login bloqueado

**Possíveis causas:**
- ❌ E-mail não confirmado
- ❌ Erro na verificação de confirmação
- ❌ Problema com RLS

**Solução:**
1. Confirme o e-mail primeiro
2. Verifique as políticas RLS
3. Execute o script de teste

### Problema: Erro 500 na API

**Possíveis causas:**
- ❌ Variáveis de ambiente incorretas
- ❌ Problema de conexão com Supabase
- ❌ Erro no Resend

**Solução:**
1. Verifique o console do navegador
2. Verifique os logs do servidor
3. Teste as APIs individualmente

## 📊 Logs de Debug

### Verificar Logs do Navegador

1. **Abra o DevTools** (F12)
2. **Vá para a aba Console**
3. **Procure por:**
   - ✅ "Usuário não encontrado na tabela de confirmação"
   - ❌ Erros de API
   - ❌ Erros de autenticação

### Verificar Logs do Servidor

1. **No terminal onde o `pnpm dev` está rodando**
2. **Procure por:**
   - ✅ "Supabase config: { url: '✅ Set', key: '✅ Set' }"
   - ❌ Erros de conexão
   - ❌ Erros de variáveis de ambiente

## ✅ Checklist Final

- [ ] **Variáveis de ambiente configuradas**
- [ ] **Scripts SQL executados**
- [ ] **Tabela `email_confirmations` criada**
- [ ] **Cadastro de usuário funciona**
- [ ] **E-mail é enviado com token**
- [ ] **Confirmação de token funciona**
- [ ] **Login após confirmação funciona**
- [ ] **Bloqueio sem confirmação funciona**
- [ ] **Token inválido é rejeitado**
- [ ] **Sem erros no console**
- [ ] **Sem erros no servidor**

## 🎉 Sucesso!

Se todos os testes passaram, o fluxo de confirmação de e-mail está **100% funcional**!

**Próximos passos:**
1. Deploy no Vercel
2. Configurar variáveis de ambiente em produção
3. Testar em produção
4. Monitorar logs e erros

---

**💡 Dica:** Mantenha este guia salvo para futuras verificações e troubleshooting! 