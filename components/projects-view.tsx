"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { Plus, FolderOpen, Edit, Trash2, Play, Pause, CheckCircle } from "lucide-react"
import { STORAGE_KEYS, LIMITS } from "@/lib/constants"
import { validators, formatters, security } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "paused"
  createdAt: string
  updatedAt: string
}

export function ProjectsView() {
  const [projects, setProjects] = useLocalStorage<Project[]>(STORAGE_KEYS.projects, [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const status = formData.get("status") as Project["status"]

    // Validações
    if (!validators.textLength(name, LIMITS.maxTitleLength)) {
      toast({
        title: "Nome muito longo",
        description: `O nome deve ter no máximo ${LIMITS.maxTitleLength} caracteres.`,
        variant: "destructive",
      })
      return
    }

    if (!validators.textLength(description, LIMITS.maxDescriptionLength)) {
      toast({
        title: "Descrição muito longa",
        description: `A descrição deve ter no máximo ${LIMITS.maxDescriptionLength} caracteres.`,
        variant: "destructive",
      })
      return
    }

    if (editingProject) {
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id ? { ...p, name, description, status, updatedAt: new Date().toISOString() } : p,
        ),
      )
      toast({
        title: "Projeto atualizado!",
        description: `${name} foi atualizado com sucesso.`,
      })
    } else {
      if (projects.length >= LIMITS.maxProjects) {
        toast({
          title: "Limite atingido",
          description: `Você pode ter no máximo ${LIMITS.maxProjects} projetos.`,
          variant: "destructive",
        })
        return
      }

      const newProject: Project = {
        id: security.generateId(),
        name,
        description,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setProjects([newProject, ...projects])
      toast({
        title: "Projeto criado!",
        description: `${name} foi criado com sucesso.`,
      })
    }

    setIsDialogOpen(false)
    setEditingProject(null)
  }

  const handleDelete = (id: string) => {
    const project = projects.find((p) => p.id === id)
    setProjects(projects.filter((p) => p.id !== id))
    toast({
      title: "Projeto excluído!",
      description: `${project?.name} foi excluído.`,
      variant: "destructive",
    })
  }

  const handleStatusChange = (id: string, status: Project["status"]) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p)))

    const statusText = {
      active: "ativado",
      paused: "pausado",
      completed: "concluído",
    }

    toast({
      title: "Status atualizado!",
      description: `Projeto ${statusText[status]}.`,
    })
  }

  const addTestProject = () => {
    const testProject: Project = {
      id: security.generateId(),
      name: "Projeto de Teste",
      description: "Este é um projeto de exemplo para demonstrar as funcionalidades do DevFlow.",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProjects([testProject, ...projects])
    toast({
      title: "Projeto de teste criado!",
      description: "Use este projeto para testar as funcionalidades.",
    })
  }

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground">Gerencie seus projetos de desenvolvimento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addTestProject}>
            Projeto de Teste
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProject(null)} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProject ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
                <DialogDescription>
                  {editingProject
                    ? "Atualize as informações do seu projeto."
                    : "Crie um novo projeto para organizar suas tarefas."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: App Mobile, Website, API..."
                    defaultValue={editingProject?.name || ""}
                    maxLength={LIMITS.maxTitleLength}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o objetivo e escopo do projeto..."
                    defaultValue={editingProject?.description || ""}
                    maxLength={LIMITS.maxDescriptionLength}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingProject?.status || "active"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingProject ? "Atualizar" : "Criar"} Projeto</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" />}
          title="Nenhum projeto ainda"
          description="Crie seu primeiro projeto para começar a organizar suas tarefas."
          action={{
            label: "Novo Projeto",
            onClick: () => setIsDialogOpen(true),
          }}
          secondaryAction={{
            label: "Criar Projeto de Teste",
            onClick: addTestProject,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover-lift animate-scale-in">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProject(project)
                        setIsDialogOpen(true)
                      }}
                      aria-label="Editar projeto"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      aria-label="Excluir projeto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{project.description || "Sem descrição"}</CardDescription>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.status !== "active" && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(project.id, "active")}>
                      <Play className="h-3 w-3 mr-1" />
                      Ativar
                    </Button>
                  )}
                  {project.status !== "paused" && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(project.id, "paused")}>
                      <Pause className="h-3 w-3 mr-1" />
                      Pausar
                    </Button>
                  )}
                  {project.status !== "completed" && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(project.id, "completed")}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">Criado em {formatters.date(project.createdAt)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
