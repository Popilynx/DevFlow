import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log("🔧 Supabase config:", { 
  url: supabaseUrl ? "✅ Set" : "❌ Missing", 
  key: supabaseAnonKey ? "✅ Set" : "❌ Missing" 
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Types for our database
export interface Profile {
  id: string
  name: string | null
  email: string | null
  bio: string | null
  location: string | null
  website: string | null
  github: string | null
  linkedin: string | null
  skills: string[] | null
  experience: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: "active" | "completed" | "paused"
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface CodeSnippet {
  id: string
  user_id: string
  title: string
  description: string | null
  code: string
  language: string
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  user_id: string
  title: string
  url: string
  description: string | null
  category: string
  tags: string[] | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  session_date: string
  session_type: "work" | "break"
  duration: number
  completed: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  notifications: {
    pomodoroComplete: boolean
    taskReminders: boolean
    projectDeadlines: boolean
    dailySummary: boolean
    soundEnabled: boolean
    volume: number
  }
  pomodoro: {
    workDuration: number
    shortBreakDuration: number
    longBreakDuration: number
    sessionsUntilLongBreak: number
    autoStartBreaks: boolean
    autoStartPomodoros: boolean
  }
  app_preferences: {
    language: string
    dateFormat: string
    timeFormat: string
    startOfWeek: string
    autoSave: boolean
    compactMode: boolean
  }
  created_at: string
  updated_at: string
}
