-- Script para testar inserção de dados (execute apenas se quiser dados de teste)
-- IMPORTANTE: Substitua 'your-user-id' pelo ID real de um usuário autenticado

-- Exemplo de como inserir dados de teste (descomente as linhas abaixo se necessário)

/*
-- Inserir projeto de teste
INSERT INTO public.projects (user_id, name, description, status) VALUES
(auth.uid(), 'Projeto de Teste DevFlow', 'Projeto criado automaticamente para testar o sistema', 'active');

-- Inserir tarefa de teste
INSERT INTO public.tasks (user_id, title, description, status, priority) VALUES
(auth.uid(), 'Tarefa de Teste', 'Primeira tarefa criada no sistema', 'pending', 'medium');

-- Inserir snippet de teste
INSERT INTO public.code_snippets (user_id, title, description, code, language, tags) VALUES
(auth.uid(), 'Hello World', 'Exemplo básico de Hello World', 'console.log("Hello, DevFlow!");', 'javascript', ARRAY['test', 'javascript']);

-- Inserir link de teste
INSERT INTO public.links (user_id, title, url, description, category, tags, is_favorite) VALUES
(auth.uid(), 'DevFlow GitHub', 'https://github.com', 'Repositório do projeto DevFlow', 'Ferramenta', ARRAY['github', 'git'], true);

-- Inserir sessão Pomodoro de teste
INSERT INTO public.pomodoro_sessions (user_id, session_type, duration, completed) VALUES
(auth.uid(), 'work', 25, true);
*/

-- Verificar se o usuário atual pode inserir dados
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'User authenticated - Ready to insert data'
    ELSE 'No authenticated user - Login required for data insertion'
  END as auth_status;
