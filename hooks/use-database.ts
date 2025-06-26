import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { cacheUtils } from "@/lib/cache"
import type { Project, Task, CodeSnippet, Link, UserSettings } from "@/lib/supabase"

// Funções auxiliares para normalizar status
function normalizeProjectStatus(status: string): string {
  const validStatuses = ["active", "completed", "paused"]
  return validStatuses.includes(status) ? status : "active"
}

function normalizeTaskStatus(status: string): string {
  const validStatuses = ["pending", "in-progress", "completed"]
  return validStatuses.includes(status) ? status : "pending"
}

// Função para criar mensagens de erro amigáveis
function createFriendlyErrorMessage(error: any, operation: string): string {
  const errorMessage = error?.message || error?.toString() || "Erro desconhecido"
  
  // Mapear erros comuns para mensagens amigáveis
  const errorMap: Record<string, string> = {
    "JWT_EXPIRED": "Sessão expirada. Faça login novamente.",
    "TOKEN_REFRESH_FAILED": "Erro de autenticação. Faça login novamente.",
    "NetworkError": "Erro de conexão. Verifique sua internet.",
    "fetch failed": "Erro de conexão. Verifique sua internet.",
    "Failed to fetch": "Erro de conexão. Verifique sua internet.",
    "Network request failed": "Erro de conexão. Verifique sua internet.",
    "ECONNRESET": "Conexão perdida. Tentando reconectar...",
    "ENOTFOUND": "Servidor não encontrado. Verifique sua conexão.",
    "ETIMEDOUT": "Tempo limite excedido. Verifique sua conexão.",
    "supabase_error": "Erro no banco de dados. Tente novamente.",
    "duplicate key value": "Item já existe com essas informações.",
    "foreign key violation": "Não é possível excluir este item pois está sendo usado.",
    "not null violation": "Preencha todos os campos obrigatórios.",
    "unique constraint": "Este item já existe.",
    "permission denied": "Você não tem permissão para esta ação.",
    "row level security": "Acesso negado. Faça login novamente."
  }

  // Verificar se há uma mensagem específica para o erro
  for (const [key, message] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return message
    }
  }

  // Mensagens genéricas baseadas na operação
  const operationMessages: Record<string, string> = {
    "create": "Erro ao criar item. Tente novamente.",
    "update": "Erro ao atualizar item. Tente novamente.",
    "delete": "Erro ao excluir item. Tente novamente.",
    "fetch": "Erro ao carregar dados. Tente novamente.",
    "load": "Erro ao carregar dados. Tente novamente."
  }

  return operationMessages[operation] || "Ocorreu um erro. Tente novamente."
}

// Hook para projetos
export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    // Verificar cache primeiro
    const cached = cacheUtils.projects.get(user.id) as Project[] | null
    if (cached) {
      setProjects(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from("projects").select("*").eq("user_id", user?.id).order("created_at", { ascending: false })
      if (error) throw error
      
      const projectsData = data || []
      setProjects(projectsData)
      
      // Salvar no cache
      cacheUtils.projects.set(user.id, projectsData)
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "load")
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createProject = useCallback(async (project: Omit<Project, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("Usuário não autenticado")
    
    console.log("🔍 Creating project:", { 
      project, 
      userId: user.id,
      userEmail: user.email,
      isAuthenticated: !!user
    })
    
    try {
      // Fazer o insert sem select
      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          name: project.name,
          description: project.description,
          status: "active",
          user_id: user.id
        })
      
      if (insertError) {
        console.error("❌ Insert error:", insertError)
        throw insertError
      }
      
      console.log("✅ Project inserted successfully")
      
      // Invalidar cache
      cacheUtils.projects.invalidate()
      
      // Recarregar a lista de projetos
      await loadProjects()
      
      return { success: true }
    } catch (err: any) {
      console.error("❌ Error creating project:", err)
      const friendlyError = createFriendlyErrorMessage(err, "create")
      throw new Error(friendlyError)
    }
  }, [user, loadProjects])

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { data, error } = await supabase.from("projects").update(updates).eq("id", id).eq("user_id", user?.id).select().single()
      if (error) throw error
      setProjects(prev => prev.map(p => p.id === id ? data : p))
      
      // Invalidar cache
      cacheUtils.projects.invalidate()
      
      return data
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "update")
      throw new Error(friendlyError)
    }
  }, [user])

  const deleteProject = useCallback(async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user?.id)
      if (error) throw error
      setProjects(prev => prev.filter(p => p.id !== id))
      
      // Invalidar cache
      cacheUtils.projects.invalidate()
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "delete")
      throw new Error(friendlyError)
    }
  }, [user])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh: loadProjects,
    retryState: {
      isRetrying: false,
      attempt: 0,
      maxAttempts: 3,
      lastError: null
    }
  }
}

// Hook para tarefas
export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    // Verificar cache primeiro
    const cached = cacheUtils.tasks.get(user.id) as Task[] | null
    if (cached) {
      setTasks(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from("tasks").select("*").eq("user_id", user?.id).order("created_at", { ascending: false })
      if (error) throw error
      
      const tasksData = data || []
      setTasks(tasksData)
      
      // Salvar no cache
      cacheUtils.tasks.set(user.id, tasksData)
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "load")
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createTask = useCallback(async (task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ 
          ...task, 
          user_id: user.id, 
          status: normalizeTaskStatus(task.status) 
        })
        .select()
        .single()
      
      if (error) throw error
      setTasks(prev => [data, ...prev])
      return data
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "create")
      throw new Error(friendlyError)
    }
  }, [user])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).eq("user_id", user?.id).select().single()
      if (error) throw error
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "update")
      throw new Error(friendlyError)
    }
  }, [user])

  const deleteTask = useCallback(async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user?.id)
      if (error) throw error
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "delete")
      throw new Error(friendlyError)
    }
  }, [user])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh: loadTasks,
    retryState: {
      isRetrying: false,
      attempt: 0,
      maxAttempts: 3,
      lastError: null
    }
  }
}

// Hook para snippets
export function useCodeSnippets() {
  const { user } = useAuth()
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSnippets = useCallback(async () => {
    if (!user) {
      setSnippets([])
      setLoading(false)
      return
    }

    // Verificar cache primeiro
    const cached = cacheUtils.snippets.get(user.id) as CodeSnippet[] | null
    if (cached) {
      setSnippets(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from("code_snippets").select("*").eq("user_id", user?.id).order("created_at", { ascending: false })
      if (error) throw error
      
      const snippetsData = data || []
      setSnippets(snippetsData)
      
      // Salvar no cache
      cacheUtils.snippets.set(user.id, snippetsData)
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "load")
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createSnippet = useCallback(async (snippet: Omit<CodeSnippet, "id" | "user_id" | "created_at">) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { data, error } = await supabase
        .from("code_snippets")
        .insert({ 
          ...snippet, 
          user_id: user.id 
        })
        .select()
        .single()
      
      if (error) throw error
      setSnippets(prev => [data, ...prev])
      return data
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "create")
      throw new Error(friendlyError)
    }
  }, [user])

  const updateSnippet = useCallback(async (id: string, updates: Partial<CodeSnippet>) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { data, error } = await supabase.from("code_snippets").update(updates).eq("id", id).eq("user_id", user?.id).select().single()
      if (error) throw error
      setSnippets(prev => prev.map(s => s.id === id ? data : s))
      return data
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "update")
      throw new Error(friendlyError)
    }
  }, [user])

  const deleteSnippet = useCallback(async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { error } = await supabase.from("code_snippets").delete().eq("id", id).eq("user_id", user?.id)
      if (error) throw error
      setSnippets(prev => prev.filter(s => s.id !== id))
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "delete")
      throw new Error(friendlyError)
    }
  }, [user])

  useEffect(() => {
    loadSnippets()
  }, [loadSnippets])

  return {
    snippets,
    loading,
    error,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    refresh: loadSnippets,
    retryState: {
      isRetrying: false,
      attempt: 0,
      maxAttempts: 3,
      lastError: null
    }
  }
}

// Hook para links
export function useLinks() {
  const { user } = useAuth()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLinks = useCallback(async () => {
    if (!user) {
      setLinks([])
      setLoading(false)
      return
    }

    // Verificar cache primeiro
    const cached = cacheUtils.links.get(user.id) as Link[] | null
    if (cached) {
      setLinks(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from("links").select("*").eq("user_id", user?.id).order("created_at", { ascending: false })
      if (error) throw error
      
      const linksData = data || []
      setLinks(linksData)
      
      // Salvar no cache
      cacheUtils.links.set(user.id, linksData)
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "load")
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createLink = useCallback(async (link: Omit<Link, "id" | "user_id" | "created_at">) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { data, error } = await supabase
        .from("links")
        .insert({ 
          ...link, 
          user_id: user.id 
        })
        .select()
        .single()
      
      if (error) throw error
      setLinks(prev => [data, ...prev])
      return data
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "create")
      throw new Error(friendlyError)
    }
  }, [user])

  const updateLink = useCallback(async (id: string, updates: Partial<Link>) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { data, error } = await supabase.from("links").update(updates).eq("id", id).eq("user_id", user?.id).select().single()
      if (error) throw error
      setLinks(prev => prev.map(l => l.id === id ? data : l))
      return data
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "update")
      throw new Error(friendlyError)
    }
  }, [user])

  const deleteLink = useCallback(async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { error } = await supabase.from("links").delete().eq("id", id).eq("user_id", user?.id)
      if (error) throw error
      setLinks(prev => prev.filter(l => l.id !== id))
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "delete")
      throw new Error(friendlyError)
    }
  }, [user])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  return {
    links,
    loading,
    error,
    createLink,
    updateLink,
    deleteLink,
    refresh: loadLinks,
    retryState: {
      isRetrying: false,
      attempt: 0,
      maxAttempts: 3,
      lastError: null
    }
  }
}

// Hook para configurações do usuário
export function useUserSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    if (!user) {
      setSettings(null)
      setLoading(false)
      return
    }

    // Verificar cache primeiro
    const cached = cacheUtils.settings.get(user.id) as UserSettings | null
    if (cached) {
      setSettings(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user?.id).single()
      if (error && error.code !== "PGRST116") throw error // PGRST116 = no rows returned
      
      const settingsData = data || null
      setSettings(settingsData)
      
      // Salvar no cache
      cacheUtils.settings.set(user.id, settingsData)
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "load")
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) throw new Error("Usuário não autenticado")
    try {
      const { data, error } = await supabase.from("user_settings").upsert([{ ...updates, user_id: user.id }]).select().single()
      if (error) throw error
      setSettings(data)
      return data
    } catch (err: any) {
      const friendlyError = createFriendlyErrorMessage(err, "update")
      throw new Error(friendlyError)
    }
  }, [user])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: loadSettings,
    retryState: {
      isRetrying: false,
      attempt: 0,
      maxAttempts: 3,
      lastError: null
    }
  }
} 