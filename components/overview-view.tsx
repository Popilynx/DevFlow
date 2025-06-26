"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Code, CheckCircle, AlertCircle } from "lucide-react"
import { useProjects } from "@/hooks/use-database"
import { useTasks } from "@/hooks/use-database"
import { useCodeSnippets } from "@/hooks/use-database"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"

export function OverviewView() {
  const { user } = useAuth()
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const { snippets } = useCodeSnippets()
  const [profile, setProfile] = useState<Profile | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") {
        // Silenciar erro de perfil não encontrado, mas logar outros erros
        if (process.env.NODE_ENV === 'development') {
          console.warn("Erro ao buscar perfil:", error.message)
        }
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Criar perfil se não existir
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuário",
              email: user.email,
            },
          ])
          .select()
          .single()

        if (insertError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn("Erro ao criar perfil:", insertError.message)
          }
        } else {
          setProfile(newProfile)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Erro inesperado ao buscar perfil:", error)
      }
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const activeProjects = projects.filter((project) => project.status === "active").length
  const completedProjects = projects.filter((project) => project.status === "completed").length

  const pendingTasks = tasks.filter((task) => task.status === "pending").length
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length

  const userName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Desenvolvedor"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {userName}!</h1>
          <p className="text-muted-foreground">Aqui está um resumo da sua produtividade hoje.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">{completedProjects} concluídos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">{inProgressTasks} em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Snippets</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snippets.length}</div>
            <p className="text-xs text-muted-foreground">Snippets salvos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} de {totalTasks} tarefas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Progresso das Tarefas</CardTitle>
            <CardDescription>Acompanhe o progresso das suas tarefas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Concluídas</span>
                <span>
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
                <div className="text-xs text-muted-foreground">Em Andamento</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Suas ações mais recentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length === 0 && tasks.length === 0 && snippets.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Nenhuma atividade ainda.</p>
                <p className="text-sm text-muted-foreground">Comece criando um projeto ou tarefa!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 2).map((project) => (
                  <div key={project.id} className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">Projeto criado</p>
                    </div>
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                ))}

                {tasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Tarefa criada</p>
                    </div>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                ))}

                {snippets.slice(0, 1).map((snippet) => (
                  <div key={snippet.id} className="flex items-center space-x-3">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{snippet.title}</p>
                      <p className="text-xs text-muted-foreground">Snippet salvo</p>
                    </div>
                    <Badge variant="outline">{snippet.language}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
