# 🗄️ Scripts SQL - DevFlow

Este diretório contém os scripts SQL essenciais para configurar o banco de dados do DevFlow no Supabase.

## 📋 Scripts Disponíveis

### 1. `001-create-tables.sql` - Criação de Tabelas
**Execute primeiro!**

Cria todas as tabelas necessárias:
- `profiles` - Perfis de usuário (com campo `role`)
- `projects` - Projetos dos usuários
- `tasks` - Tarefas dos usuários
- `code_snippets` - Snippets de código
- `links` - Links favoritos
- `pomodoro_sessions` - Sessões do Pomodoro
- `user_settings` - Configurações dos usuários

**Inclui:**
- Índices para performance
- Constraints de validação
- Comentários de documentação

### 2. `002-enable-rls.sql` - Row Level Security
**Execute segundo!**

Habilita RLS e cria políticas de segurança:
- Usuários só veem/editaram seus próprios dados
- Políticas para todas as operações (SELECT, INSERT, UPDATE, DELETE)
- Segurança por usuário em todas as tabelas

### 3. `003-create-functions.sql` - Funções e Triggers
**Execute terceiro!**

Cria funções e triggers essenciais:
- `update_updated_at_column()` - Atualiza timestamps
- `is_admin_user()` - Verifica se usuário é admin
- `handle_new_user()` - Cria perfil e configurações para novos usuários
- `update_user_role()` - Atualiza roles (apenas admins)
- `get_current_user_role()` - Obtém role do usuário atual
- Triggers para atualização automática de timestamps
- Trigger para criação automática de perfil

### 4. `005-email-confirmations.sql` - Confirmação de Email
**Execute se necessário!**

Cria a tabela para confirmação de e-mail customizada:
- `email_confirmations` - Tokens de confirmação de e-mail
- Índices para performance
- Políticas RLS para segurança

**Inclui:**
- Tabela com campos: id, user_id, email, token, created_at, confirmed
- Índices otimizados
- Políticas de segurança

### 5. `004-production-verification.sql` - Verificação Final
**Execute por último!**

Script de verificação que valida:
- ✅ Todas as tabelas foram criadas
- ✅ RLS está habilitado
- ✅ Políticas foram criadas
- ✅ Funções estão funcionando
- ✅ Triggers foram criados
- ✅ Índices foram criados
- ✅ Campo `role` está presente

## 🚀 Como Executar

### No Supabase Dashboard:

1. **Acesse o SQL Editor** no painel do Supabase
2. **Execute os scripts na ordem**:
   ```sql
   -- 1. Primeiro
   -- Cole e execute: 001-create-tables.sql
   
   -- 2. Segundo  
   -- Cole e execute: 002-enable-rls.sql
   
   -- 3. Terceiro
   -- Cole e execute: 003-create-functions.sql
   
   -- 4. Quarto (se necessário)
   -- Cole e execute: 005-email-confirmations.sql
   
   -- 5. Por último
   -- Cole e execute: 004-production-verification.sql
   ```

### Verificação:

Após executar o script de verificação, você deve ver:
- ✅ **Tabelas criadas**: 7/7
- ✅ **Políticas RLS**: 20+ políticas
- ✅ **Funções criadas**: 5/5
- ✅ **Triggers criados**: 6+ triggers

## 🔧 Configurações Adicionais

### 1. Configurar Email de Confirmação

No Supabase Dashboard > Authentication > Settings:
- ✅ Marque "Enable email confirmations"
- ✅ Configure templates de email

### 2. Configurar URLs de Redirecionamento

No Supabase Dashboard > Authentication > URL Configuration:
```
Site URL: https://seu-projeto.vercel.app
Redirect URLs:
- https://seu-projeto.vercel.app/confirmacao
- https://seu-projeto.vercel.app/reset-password
```

### 3. Emails de Administrador

Os seguintes emails são automaticamente configurados como admin:
- `renato@example.com`
- `admin@devflow.com`

Para alterar, edite a função `is_admin_user()` no script `003-create-functions.sql`.

## 🛡️ Segurança

### Row Level Security (RLS)
- ✅ Todas as tabelas têm RLS habilitado
- ✅ Usuários só acessam seus próprios dados
- ✅ Admins podem gerenciar todos os perfis
- ✅ Políticas específicas para cada operação

### Funções Seguras
- ✅ `SECURITY DEFINER` nas funções críticas
- ✅ Verificação de permissões de admin
- ✅ Validação de dados de entrada

## 📊 Estrutura do Banco

```
auth.users (Supabase Auth)
    ↓
public.profiles (Perfis + Roles)
    ↓
public.projects (Projetos)
public.tasks (Tarefas)
public.code_snippets (Snippets)
public.links (Links)
public.pomodoro_sessions (Pomodoro)
public.user_settings (Configurações)
```

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- Execute os scripts na ordem correta
- Verifique se está no schema `public`

### Erro: "permission denied"
- Verifique se RLS está habilitado
- Confirme se as políticas foram criadas

### Erro: "function does not exist"
- Execute o script `003-create-functions.sql`
- Verifique se não há erros de sintaxe

### Usuário não consegue acessar dados
- Verifique se o perfil foi criado automaticamente
- Confirme se o trigger `on_auth_user_created` está ativo

## 📝 Notas Importantes

- **Ordem de execução é crucial**
- **Não execute scripts duplicados**
- **Faça backup antes de executar em produção**
- **Teste em ambiente de desenvolvimento primeiro**

---

**🎉 Seu banco de dados está pronto para produção!** 