"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import type { Project, Task, CodeSnippet } from "@/lib/supabase"

export function useProjects() {
  const { user, demoMode } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (demoMode) {
      // Usar dados mockados para demo
      const mockProjects = JSON.parse(localStorage.getItem("devflow_projects") || "[]")
      setProjects(mockProjects)
      setLoading(false)
      return
    }

    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    fetchProjects()
  }, [user, demoMode])

  const fetchProjects = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      console.error("Erro ao buscar projetos:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (project: Omit<Project, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (demoMode) {
      const newProject = {
        id: Date.now().toString(),
        user_id: "demo",
        ...project,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const updated = [...projects, newProject]
      setProjects(updated)
      localStorage.setItem("devflow_projects", JSON.stringify(updated))
      return newProject
    }

    if (!user) throw new Error("Usuário não autenticado")

    try {
      setError(null)
      const { data, error } = await supabase
        .from("projects")
        .insert([{ ...project, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setProjects([data, ...projects])
      return data
    } catch (error: any) {
      console.error("Erro ao criar projeto:", error)
      setError(error.message)
      throw error
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (demoMode) {
      const updated = projects.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p,
      )
      setProjects(updated)
      localStorage.setItem("devflow_projects", JSON.stringify(updated))
      return
    }

    try {
      setError(null)
      const { error } = await supabase
        .from("projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user?.id)

      if (error) throw error
      setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)))
    } catch (error: any) {
      console.error("Erro ao atualizar projeto:", error)
      setError(error.message)
      throw error
    }
  }

  const deleteProject = async (id: string) => {
    if (demoMode) {
      const updated = projects.filter((p) => p.id !== id)
      setProjects(updated)
      localStorage.setItem("devflow_projects", JSON.stringify(updated))
      return
    }

    try {
      setError(null)
      const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error
      setProjects(projects.filter((p) => p.id !== id))
    } catch (error: any) {
      console.error("Erro ao deletar projeto:", error)
      setError(error.message)
      throw error
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  }
}

export function useTasks() {
  const { user, demoMode } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (demoMode) {
      const mockTasks = JSON.parse(localStorage.getItem("devflow_tasks") || "[]")
      setTasks(mockTasks)
      setLoading(false)
      return
    }

    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    fetchTasks()
  }, [user, demoMode])

  const fetchTasks = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error: any) {
      console.error("Erro ao buscar tarefas:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (demoMode) {
      const newTask = {
        id: Date.now().toString(),
        user_id: "demo",
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const updated = [...tasks, newTask]
      setTasks(updated)
      localStorage.setItem("devflow_tasks", JSON.stringify(updated))
      return newTask
    }

    if (!user) throw new Error("Usuário não autenticado")

    try {
      setError(null)
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...task, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setTasks([data, ...tasks])
      return data
    } catch (error: any) {
      console.error("Erro ao criar tarefa:", error)
      setError(error.message)
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (demoMode) {
      const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
      setTasks(updated)
      localStorage.setItem("devflow_tasks", JSON.stringify(updated))
      return
    }

    try {
      setError(null)
      const { error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user?.id)

      if (error) throw error
      setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    } catch (error: any) {
      console.error("Erro ao atualizar tarefa:", error)
      setError(error.message)
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    if (demoMode) {
      const updated = tasks.filter((t) => t.id !== id)
      setTasks(updated)
      localStorage.setItem("devflow_tasks", JSON.stringify(updated))
      return
    }

    try {
      setError(null)
      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error
      setTasks(tasks.filter((t) => t.id !== id))
    } catch (error: any) {
      console.error("Erro ao deletar tarefa:", error)
      setError(error.message)
      throw error
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  }
}

export function useCodeSnippets() {
  const { user, demoMode } = useAuth()
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (demoMode) {
      const mockSnippets = JSON.parse(localStorage.getItem("devflow_snippets") || "[]")
      setSnippets(mockSnippets)
      setLoading(false)
      return
    }

    if (!user) {
      setSnippets([])
      setLoading(false)
      return
    }

    fetchSnippets()
  }, [user, demoMode])

  const fetchSnippets = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from("code_snippets")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSnippets(data || [])
    } catch (error: any) {
      console.error("Erro ao buscar snippets:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createSnippet = async (snippet: Omit<CodeSnippet, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (demoMode) {
      const newSnippet = {
        id: Date.now().toString(),
        user_id: "demo",
        ...snippet,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const updated = [...snippets, newSnippet]
      setSnippets(updated)
      localStorage.setItem("devflow_snippets", JSON.stringify(updated))
      return newSnippet
    }

    if (!user) throw new Error("Usuário não autenticado")

    try {
      setError(null)
      const { data, error } = await supabase
        .from("code_snippets")
        .insert([{ ...snippet, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setSnippets([data, ...snippets])
      return data
    } catch (error: any) {
      console.error("Erro ao criar snippet:", error)
      setError(error.message)
      throw error
    }
  }

  const updateSnippet = async (id: string, updates: Partial<CodeSnippet>) => {
    if (demoMode) {
      const updated = snippets.map((s) =>
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s,
      )
      setSnippets(updated)
      localStorage.setItem("devflow_snippets", JSON.stringify(updated))
      return
    }

    try {
      setError(null)
      const { error } = await supabase
        .from("code_snippets")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user?.id)

      if (error) throw error
      setSnippets(snippets.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    } catch (error: any) {
      console.error("Erro ao atualizar snippet:", error)
      setError(error.message)
      throw error
    }
  }

  const deleteSnippet = async (id: string) => {
    if (demoMode) {
      const updated = snippets.filter((s) => s.id !== id)
      setSnippets(updated)
      localStorage.setItem("devflow_snippets", JSON.stringify(updated))
      return
    }

    try {
      setError(null)
      const { error } = await supabase.from("code_snippets").delete().eq("id", id).eq("user_id", user?.id)

      if (error) throw error
      setSnippets(snippets.filter((s) => s.id !== id))
    } catch (error: any) {
      console.error("Erro ao deletar snippet:", error)
      setError(error.message)
      throw error
    }
  }

  return {
    snippets,
    loading,
    error,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    refetch: fetchSnippets,
  }
}
