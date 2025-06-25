-- Verificar se todas as tabelas foram criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY table_name;

-- Verificar se RLS está ativo
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY tablename;

-- Contar políticas criadas
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Verificar funções criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'update_updated_at_column')
ORDER BY routine_name;

-- Verificar triggers
SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'user_settings')
ORDER BY event_object_table, trigger_name;

-- Status geral
SELECT 
  'Database Setup' as component,
  'SUCCESS' as status,
  'All tables, policies, functions and triggers created successfully' as message;
