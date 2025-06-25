"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { Plus, CheckSquare, Edit, Trash2, Calendar } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  projectId?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  status: string
}

export function TasksView() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("devflow_tasks", [])
  const [projects] = useLocalStorage<Project[]>("devflow_projects", [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const status = formData.get("status") as Task["status"]
    const priority = formData.get("priority") as Task["priority"]
    const projectId = formData.get("projectId") as string
    const dueDate = formData.get("dueDate") as string

    if (editingTask) {
      setTasks(
        tasks.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title,
                description,
                status,
                priority,
                projectId: projectId || undefined,
                dueDate: dueDate || undefined,
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      )
      toast({
        title: "Tarefa atualizada!",
        description: `${title} foi atualizada com sucesso.`,
      })
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        description,
        status,
        priority,
        projectId: projectId || undefined,
        dueDate: dueDate || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTasks([...tasks, newTask])
      toast({
        title: "Tarefa criada!",
        description: `${title} foi criada com sucesso.`,
      })
    }

    setIsDialogOpen(false)
    setEditingTask(null)
  }

  const handleDelete = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    setTasks(tasks.filter((t) => t.id !== id))
    toast({
      title: "Tarefa excluída!",
      description: `${task?.title} foi excluída.`,
      variant: "destructive",
    })
  }

  const handleStatusChange = (id: string, status: Task["status"]) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t)))

    const statusText = {
      pending: "pendente",
      "in-progress": "em progresso",
      completed: "concluída",
    }

    toast({
      title: "Status atualizado!",
      description: `Tarefa marcada como ${statusText[status]}.`,
    })
  }

  const addTestTask = () => {
    const testTask: Task = {
      id: Date.now().toString(),
      title: "Tarefa de Teste",
      description: "Esta é uma tarefa de exemplo para demonstrar as funcionalidades do DevFlow.",
      status: "pending",
      priority: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks([...tasks, testTask])
    toast({
      title: "Tarefa de teste criada!",
      description: "Use esta tarefa para testar as funcionalidades.",
    })
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }
  }

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "in-progress":
        return "Em Progresso"
      case "completed":
        return "Concluída"
    }
  }

  const getPriorityText = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return "Baixa"
      case "medium":
        return "Média"
      case "high":
        return "Alta"
    }
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null
    const project = projects.find((p) => p.id === projectId)
    return project?.name
  }

  const filterTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={getStatusColor(task.status)}>{getStatusText(task.status)}</Badge>
              <Badge className={getPriorityColor(task.priority)}>{getPriorityText(task.priority)}</Badge>
              {task.projectId && <Badge variant="outline">{getProjectName(task.projectId)}</Badge>}
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingTask(task)
                setIsDialogOpen(true)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{task.description || "Sem descrição"}</CardDescription>

        {task.dueDate && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Calendar className="h-4 w-4 mr-1" />
            Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {task.status !== "in-progress" && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange(task.id, "in-progress")}>
              Iniciar
            </Button>
          )}
          {task.status !== "completed" && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange(task.id, "completed")}>
              <CheckSquare className="h-3 w-3 mr-1" />
              Concluir
            </Button>
          )}
          {task.status === "completed" && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange(task.id, "pending")}>
              Reabrir
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Criada em {new Date(task.createdAt).toLocaleDateString("pt-BR")}
        </div>
      </CardContent>
    </Card>
  )

  const TaskListItem = ({ task }: { task: Task }) => (
    <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-shadow">
      <Checkbox
        checked={task.status === "completed"}
        onCheckedChange={(checked) => handleStatusChange(task.id, checked ? "completed" : "pending")}
      />
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
          {task.title}
        </h3>
        {task.description && <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{task.description}</p>}
        <div className="flex items-center space-x-2 mt-2">
          <Badge className={getStatusColor(task.status)} variant="secondary">
            {getStatusText(task.status)}
          </Badge>
          <Badge className={getPriorityColor(task.priority)} variant="secondary">
            {getPriorityText(task.priority)}
          </Badge>
          {task.projectId && <Badge variant="outline">{getProjectName(task.projectId)}</Badge>}
          {task.dueDate && (
            <span className="text-xs text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(task.dueDate).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setEditingTask(task)
            setIsDialogOpen(true)
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tarefas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas tarefas e acompanhe o progresso</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addTestTask}>
            Tarefa de Teste
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTask(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
                <DialogDescription>
                  {editingTask
                    ? "Atualize as informações da sua tarefa."
                    : "Crie uma nova tarefa para organizar seu trabalho."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Tarefa</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: Implementar login, Corrigir bug..."
                    defaultValue={editingTask?.title || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva os detalhes da tarefa..."
                    defaultValue={editingTask?.description || ""}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingTask?.status || "pending"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in-progress">Em Progresso</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select name="priority" defaultValue={editingTask?.priority || "medium"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectId">Projeto (Opcional)</Label>
                  <Select name="projectId" defaultValue={editingTask?.projectId || "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum projeto</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data de Prazo (Opcional)</Label>
                  <Input id="dueDate" name="dueDate" type="date" defaultValue={editingTask?.dueDate || ""} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingTask ? "Atualizar" : "Criar"} Tarefa</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "cards")}>
          <TabsList>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {tasks.length} tarefa{tasks.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Tasks Content */}
      {tasks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma tarefa ainda</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Crie sua primeira tarefa para começar a organizar seu trabalho.
            </p>
            <Button onClick={addTestTask} variant="outline" className="mr-2">
              Criar Tarefa de Teste
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pendentes ({filterTasksByStatus("pending").length})</TabsTrigger>
            <TabsTrigger value="in-progress">Em Progresso ({filterTasksByStatus("in-progress").length})</TabsTrigger>
            <TabsTrigger value="completed">Concluídas ({filterTasksByStatus("completed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTasksByStatus("pending").map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filterTasksByStatus("pending").map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTasksByStatus("in-progress").map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filterTasksByStatus("in-progress").map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTasksByStatus("completed").map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filterTasksByStatus("completed").map((task) => (
                  <TaskListItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
