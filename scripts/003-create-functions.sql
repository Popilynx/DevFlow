-- =====================================================
-- DEVFLOW - SCRIPT DE FUNÇÕES E TRIGGERS
-- Execute este script após habilitar RLS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin (without recursion)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user email is in admin list
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('renato@example.com', 'admin@devflow.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation with role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile with role
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.email IN ('renato@example.com', 'admin@devflow.com') THEN 'admin'
      ELSE 'user'
    END
  );
  
  -- Create user settings with defaults
  INSERT INTO public.user_settings (user_id, notifications, pomodoro, app_preferences)
  VALUES (
    NEW.id,
    '{"pomodoroComplete": true, "taskReminders": true, "projectDeadlines": true, "dailySummary": false, "soundEnabled": true, "volume": 50}',
    '{"workDuration": 25, "shortBreakDuration": 5, "longBreakDuration": 15, "sessionsUntilLongBreak": 4, "autoStartBreaks": false, "autoStartPomodoros": false}',
    '{"language": "pt-BR", "dateFormat": "DD/MM/YYYY", "timeFormat": "24h", "startOfWeek": "monday", "autoSave": true, "compactMode": false}'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(user_uuid UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the executing user is admin
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar roles';
  END IF;

  -- Update role
  UPDATE public.profiles 
  SET role = new_role, updated_at = NOW()
  WHERE id = user_uuid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_code_snippets_updated_at ON public.code_snippets;
DROP TRIGGER IF EXISTS update_links_updated_at ON public.links;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at 
  BEFORE UPDATE ON public.code_snippets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at 
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add admin policy for profiles (after creating is_admin_user function)
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin_user());

-- Add comments for documentation
COMMENT ON FUNCTION public.is_admin_user IS 'Verifica se o usuário atual é administrador';
COMMENT ON FUNCTION public.update_user_role IS 'Atualiza role de usuário (apenas admins)';
COMMENT ON FUNCTION public.get_current_user_role IS 'Obtém role do usuário atual';
COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil e configurações para novos usuários';
