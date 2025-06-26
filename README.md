# 🚀 DevFlow - Plataforma Completa para Desenvolvedores

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-black?style=for-the-badge&logo=supabase)](https://supabase.com)

## 📋 Visão Geral

O **DevFlow** é uma plataforma completa para desenvolvedores organizarem projetos, gerenciarem tarefas e aumentarem a produtividade com ferramentas integradas.

### ✨ Funcionalidades Principais

- 📊 **Gestão de Projetos** - Organize e acompanhe seus projetos
- ✅ **Controle de Tarefas** - Gerencie tarefas com prioridades e status
- 💻 **Code Snippets** - Armazene e organize snippets de código
- 🔗 **Links Favoritos** - Salve e categorize links importantes
- ⏱️ **Pomodoro Timer** - Técnica de produtividade integrada
- 👤 **Sistema de Roles** - Admin e usuários com permissões diferentes
- 📧 **Validação por Email** - Confirmação obrigatória de email
- 🎨 **Interface Moderna** - Design responsivo e tema escuro/claro

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Deploy**: Vercel
- **IA**: Google Gemini (para geração de snippets)

## 🚀 Deploy Rápido

### Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Projeto Supabase**: [supabase.com](https://supabase.com)
3. **Repositório GitHub** com o código

### 1. Configurar Supabase

#### Executar Scripts SQL (na ordem):

```sql
-- 1. Criação de tabelas
-- Execute: scripts/001-create-tables.sql

-- 2. Habilitar RLS
-- Execute: scripts/002-enable-rls.sql

-- 3. Criar funções e triggers
-- Execute: scripts/003-create-functions.sql

-- 4. Verificação final
-- Execute: scripts/004-production-verification.sql
```

#### Configurar Autenticação:

1. **Authentication > Settings**:
   - ✅ Marque "Enable email confirmations"
   - ✅ Configure templates de email

2. **Authentication > URL Configuration**:
   ```
   Site URL: https://seu-projeto.vercel.app
   Redirect URLs:
   - https://seu-projeto.vercel.app/confirmacao
   - https://seu-projeto.vercel.app/reset-password
   ```

### 2. Deploy no Vercel

1. **Conectar Repositório**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte seu repositório GitHub

2. **Configurar Variáveis de Ambiente**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   NEXT_PUBLIC_SITE_URL=https://seu-projeto.vercel.app
   ```

3. **Deploy**:
   - Clique em "Deploy"
   - Aguarde o build
   - Acesse sua URL

## 📧 Fluxo de Validação por Email

### Como Funciona

1. **Usuário se registra** na landing page
2. **Sistema envia email** com link de confirmação
3. **Usuário confirma** clicando no link ou colando o token
4. **Conta é ativada** e redirecionada para o dashboard

### URLs Importantes

- **Landing Page**: `/` - Registro e login
- **Confirmação**: `/confirmacao` - Validação de email
- **Reset Password**: `/reset-password` - Recuperação de senha
- **Dashboard**: `/dashboard` - Área principal

## 🔒 Segurança

### Row Level Security (RLS)
- ✅ Todas as tabelas protegidas
- ✅ Usuários só acessam seus próprios dados
- ✅ Admins podem gerenciar todos os perfis

### Autenticação
- ✅ Confirmação obrigatória de email
- ✅ Tokens únicos e com expiração
- ✅ Recuperação de senha segura

### Headers de Segurança
```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 👥 Sistema de Roles

### Emails de Administrador
- `renato@example.com`
- `admin@devflow.com`

### Permissões
- **Admin**: Acesso total, gerenciamento de usuários
- **User**: Acesso às funcionalidades básicas

## 🗄️ Estrutura do Banco

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

## 🧪 Testes Recomendados

### 1. Teste de Registro
- [ ] Criar conta nova
- [ ] Verificar email de confirmação
- [ ] Confirmar email (link ou token)
- [ ] Acessar dashboard

### 2. Teste de Login
- [ ] Fazer logout
- [ ] Tentar login sem confirmar email (deve falhar)
- [ ] Confirmar email
- [ ] Fazer login (deve funcionar)

### 3. Teste de Funcionalidades
- [ ] Criar projeto
- [ ] Adicionar tarefas
- [ ] Salvar snippets
- [ ] Usar Pomodoro
- [ ] Gerenciar links

## 🐛 Troubleshooting

### Erro 500 no Deploy
- Verifique variáveis de ambiente
- Confirme se Supabase está acessível
- Verifique logs do Vercel

### Email não chega
- Verifique configuração no Supabase
- Confirme pasta de spam
- Teste com email válido

### Erro de Autenticação
- Verifique chaves do Supabase
- Confirme políticas RLS
- Verifique trigger de criação de perfil

### Erro de CORS
- Verifique URLs de redirecionamento
- Confirme `NEXT_PUBLIC_SITE_URL`

## 📁 Estrutura do Projeto

```
DevFlow/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── confirmacao/       # Página de confirmação
│   └── reset-password/    # Recuperação de senha
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── *.tsx             # Componentes específicos
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
├── scripts/              # Scripts SQL
│   ├── 001-create-tables.sql
│   ├── 002-enable-rls.sql
│   ├── 003-create-functions.sql
│   └── 004-production-verification.sql
└── public/               # Arquivos estáticos
```

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run lint
```

## 📝 Scripts SQL

### Ordem de Execução
1. `001-create-tables.sql` - Criação de tabelas
2. `002-enable-rls.sql` - Row Level Security
3. `003-create-functions.sql` - Funções e Triggers
4. `004-production-verification.sql` - Verificação final

### Verificação
Após executar todos os scripts, você deve ver:
- ✅ **Tabelas criadas**: 7/7
- ✅ **Políticas RLS**: 20+ políticas
- ✅ **Funções criadas**: 5/5
- ✅ **Triggers criados**: 6+ triggers

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- Registro com confirmação de email
- Login seguro
- Recuperação de senha
- Sistema de roles (admin/user)

### ✅ Gestão de Dados
- Projetos com status e descrição
- Tarefas com prioridade e prazo
- Snippets de código com linguagem
- Links favoritos categorizados
- Sessões de Pomodoro
- Configurações personalizadas

### ✅ Interface
- Design responsivo
- Tema escuro/claro
- Loading states
- Feedback visual
- Navegação intuitiva

### ✅ Segurança
- Row Level Security (RLS)
- Validação de email obrigatória
- Tokens seguros
- Headers de segurança

## 🚀 Próximos Passos

1. **Deploy no Vercel** seguindo o guia acima
2. **Configurar domínio personalizado** (opcional)
3. **Configurar analytics** (opcional)
4. **Monitorar logs** e performance

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Vercel
2. Confirme as configurações do Supabase
3. Teste localmente primeiro
4. Verifique se todas as dependências estão instaladas

## 📄 Licença

Este projeto está sob a licença MIT.

---

**🎉 Seu DevFlow está pronto para produção!**

*Uma plataforma completa para desenvolvedores organizarem projetos e aumentarem a produtividade.*