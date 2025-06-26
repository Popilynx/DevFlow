# Solução para Erro 500 - Recursão Infinita nas Políticas RLS

## Problema
O erro 500 agora é causado por **recursão infinita nas políticas RLS**. A política "Admins can manage all profiles" estava tentando verificar se o usuário é admin consultando a tabela `profiles`, que por sua vez disparava a mesma política, criando um loop infinito.

## Solução

### Execute o Script SQL no Supabase

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Execute o arquivo `scripts/014-fix-rls-recursion.sql`

Este script irá:
- ✅ Remover todas as políticas RLS problemáticas
- ✅ Criar políticas RLS corrigidas (sem recursão)
- ✅ Criar função `is_admin_user()` que verifica email diretamente
- ✅ Criar o perfil do usuário que está causando erro
- ✅ Testar as consultas para verificar se funcionam

### Como Funciona a Correção

1. **Verificação por Email**: A função `is_admin_user()` verifica se o email está na lista de admins diretamente na tabela `auth.users`, evitando consultar `profiles`

2. **Políticas Simplificadas**: As políticas agora são mais simples e não causam recursão

3. **Fallback Robusto**: O hook `useRoles` foi atualizado para usar verificação por email primeiro, evitando consultas problemáticas

### Após Executar o Script

1. **Faça logout e login novamente** no DevFlow
2. **Verifique se o erro 500 não aparece mais**
3. **Confirme que o perfil está sendo carregado**

## Estrutura das Políticas RLS Corrigidas

```sql
-- Política para usuários verem seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para usuários inserirem seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para admins gerenciarem todos os perfis (sem recursão)
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (is_admin_user());
```

## Função is_admin_user()

```sql
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
```

## Hook useRoles Atualizado

O hook `useRoles` foi atualizado para:

1. **Verificar email primeiro**: Evita consultas problemáticas
2. **Fallback robusto**: Se houver erro, assume role "user"
3. **Tratamento de erros**: Não falha se não conseguir criar perfil

## Verificação Manual

Execute estes comandos no SQL Editor para verificar:

```sql
-- Verificar políticas RLS
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Testar função is_admin_user
SELECT is_admin_user() as is_admin;

-- Testar consultas
SELECT * FROM public.profiles WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';
SELECT role FROM public.profiles WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';
```

## Painel de Debug (Opcional)

Se você for administrador, pode usar o painel de debug:

1. Acesse o menu lateral
2. Clique em "Debug" (apenas para admins)
3. Execute o diagnóstico
4. Use o botão "Criar Perfil" se necessário

## Se o Problema Persistir

1. **Verifique os logs do Supabase** no Dashboard
2. **Execute o painel de debug** (se for admin)
3. **Verifique se o usuário existe** em `auth.users`
4. **Confirme se as políticas RLS estão corretas**
5. **Teste as consultas diretamente** no SQL Editor

## Comandos de Teste

Execute estes comandos para testar se tudo está funcionando:

```sql
-- Testar consulta de perfil
SELECT * FROM public.profiles WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';

-- Testar consulta de role
SELECT role FROM public.profiles WHERE id = '1dad715d-e41c-401f-8c4c-d4120015389a';

-- Verificar se é admin
SELECT is_admin_user() as is_admin;

-- Verificar estrutura completa
\d public.profiles;
```

## Contato

Se precisar de ajuda adicional, verifique:
- Logs do console do navegador
- Logs do Supabase
- Painel de debug (se for admin) 