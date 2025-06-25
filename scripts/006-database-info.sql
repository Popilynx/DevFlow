-- Informações completas do banco de dados DevFlow

-- Resumo das tabelas
SELECT 
  t.table_name,
  t.table_type,
  COALESCE(c.column_count, 0) as columns,
  CASE WHEN p.tablename IS NOT NULL THEN 'YES' ELSE 'NO' END as rls_enabled
FROM information_schema.tables t
LEFT JOIN (
  SELECT table_name, COUNT(*) as column_count
  FROM information_schema.columns 
  WHERE table_schema = 'public'
  GROUP BY table_name
) c ON t.table_name = c.table_name
LEFT JOIN pg_tables p ON t.table_name = p.tablename AND p.schemaname = 'public' AND p.rowsecurity = true
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY t.table_name;

-- Detalhes das colunas por tabela
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY table_name, ordinal_position;

-- Relacionamentos (Foreign Keys)
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY tc.table_name, kcu.column_name;

-- Índices criados
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'projects', 'tasks', 'code_snippets', 'links', 'pomodoro_sessions', 'user_settings')
ORDER BY tablename, indexname;

-- Status final
SELECT 
  '🎉 DevFlow Database Setup Complete!' as status,
  'All tables, security policies, functions, and triggers are ready' as message,
  'You can now use the application with full database functionality' as next_steps;
