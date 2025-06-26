# Configuração do Supabase

## Problema Identificado

Os dados não estão sendo salvos no banco de dados porque as variáveis de ambiente do Supabase não estão configuradas.

## Solução

### 1. Criar arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
```

### 2. Obter credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto (ou crie um novo)
4. Vá para **Settings** > **API**
5. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar banco de dados

Execute os scripts SQL na seguinte ordem:

1. `scripts/001-create-tables.sql` - Criar tabelas
2. `scripts/002-enable-rls.sql` - Habilitar RLS
3. `scripts/003-create-functions.sql` - Criar funções e triggers
4. `scripts/004-seed-demo-data.sql` - Dados de exemplo (opcional)

### 4. Verificar configuração

1. Acesse a página **Debug** na aplicação
2. Verifique se as variáveis estão configuradas
3. Teste criando um projeto ou tarefa

## Modo Demo

Se não quiser configurar o Supabase agora, você pode usar o **Modo Demo**:

1. Acesse a página **Debug**
2. Clique em **"Ativar Demo"**
3. Os dados serão salvos apenas no localStorage

## Estrutura do Banco

O banco deve ter as seguintes tabelas:
- `profiles` - Perfis dos usuários
- `projects` - Projetos
- `tasks` - Tarefas
- `code_snippets` - Snippets de código
- `links` - Links úteis
- `pomodoro_sessions` - Sessões do Pomodoro
- `user_settings` - Configurações do usuário

## Troubleshooting

### Erro "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão corretas
- Reinicie o servidor de desenvolvimento

### Dados não aparecem
- Verifique se as tabelas foram criadas
- Confirme se o RLS está configurado
- Verifique os logs no console do navegador

### Erro de autenticação
- Verifique se o usuário foi criado na tabela `profiles`
- Confirme se as políticas RLS estão corretas 