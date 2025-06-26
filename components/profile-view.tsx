"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { useRoles } from "@/hooks/use-roles"
import {
  User,
  Edit,
  Save,
  X,
  Trophy,
  Target,
  Code,
  Timer,
  Calendar,
  Star,
  Zap,
  Award,
  TrendingUp,
  Camera,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Plus,
  ExternalLink,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  name: string
  email: string
  bio: string
  website: string
  github: string
  linkedin: string
  skills: string[]
  experience: string
  avatar?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

const SKILL_SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Styled Components",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Firebase",
  "Supabase",
  "AWS",
  "Docker",
  "Git",
]

export function ProfileView() {
  const { user } = useAuth()
  const { role, loading: roleLoading } = useRoles()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [projects] = useLocalStorage("devflow_projects", [])
  const [tasks] = useLocalStorage("devflow_tasks", [])
  const [snippets] = useLocalStorage("devflow_snippets", [])
  const [pomodoroSessions] = useLocalStorage("devflow_pomodoro_sessions", [])

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [newSkill, setNewSkill] = useState("")
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Carregar perfil do Supabase
  const loadProfile = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: dbError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (dbError && dbError.code !== "PGRST116") {
        throw dbError
      }

      if (data) {
        const profileData: UserProfile = {
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "Desenvolvedor apaixonado por tecnologia e inovação. Sempre em busca de novos desafios e aprendizados.",
          website: data.website || "https://meusite.dev",
          github: data.github || "https://github.com/usuario",
          linkedin: data.linkedin || "https://linkedin.com/in/usuario",
          skills: data.skills || ["JavaScript", "React", "Node.js", "TypeScript", "Python", "Git"],
          experience: data.experience || "3+ anos",
          avatar: data.avatar_url,
        }
        setProfile(profileData)
        setEditedProfile(profileData)
      } else {
        // Criar perfil padrão se não existir
        const defaultProfile: UserProfile = {
          name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuário",
          email: user.email || "",
          bio: "Desenvolvedor apaixonado por tecnologia e inovação. Sempre em busca de novos desafios e aprendizados.",
          website: "https://meusite.dev",
          github: "https://github.com/usuario",
          linkedin: "https://linkedin.com/in/usuario",
          skills: ["JavaScript", "React", "Node.js", "TypeScript", "Python", "Git"],
          experience: "3+ anos",
        }
        setProfile(defaultProfile)
        setEditedProfile(defaultProfile)
      }
    } catch (err: any) {
      console.error("Erro ao carregar perfil:", err)
      setError("Erro ao carregar perfil do usuário")
    } finally {
      setLoading(false)
    }
  }

  // Sincronizar editedProfile com profile
  useEffect(() => {
    if (profile) {
      setEditedProfile(profile)
    }
  }, [profile])

  useEffect(() => {
    loadProfile()
  }, [user])

  // Calcular estatísticas
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter((p: any) => p.status === "completed").length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t: any) => t.status === "completed").length,
    totalSnippets: snippets.length,
    totalPomodoros: pomodoroSessions.filter((s: any) => s.type === "work" && s.completed).length,
    joinedDays: Math.floor((Date.now() - new Date("2024-01-01").getTime()) / (1000 * 60 * 60 * 24)),
  }

  // Conquistas
  const achievements: Achievement[] = [
    {
      id: "first-project",
      title: "Primeiro Projeto",
      description: "Criou seu primeiro projeto",
      icon: "🎯",
      unlocked: stats.totalProjects > 0,
      unlockedAt: stats.totalProjects > 0 ? "2024-01-15" : undefined,
    },
    {
      id: "task-master",
      title: "Mestre das Tarefas",
      description: "Completou 10 tarefas",
      icon: "✅",
      unlocked: stats.completedTasks >= 10,
      unlockedAt: stats.completedTasks >= 10 ? "2024-02-01" : undefined,
    },
    {
      id: "code-collector",
      title: "Colecionador de Código",
      description: "Salvou 5 snippets de código",
      icon: "💻",
      unlocked: stats.totalSnippets >= 5,
      unlockedAt: stats.totalSnippets >= 5 ? "2024-01-20" : undefined,
    },
    {
      id: "pomodoro-warrior",
      title: "Guerreiro Pomodoro",
      description: "Completou 25 sessões Pomodoro",
      icon: "🍅",
      unlocked: stats.totalPomodoros >= 25,
      unlockedAt: stats.totalPomodoros >= 25 ? "2024-02-10" : undefined,
    },
    {
      id: "project-finisher",
      title: "Finalizador",
      description: "Completou 3 projetos",
      icon: "🏆",
      unlocked: stats.completedProjects >= 3,
      unlockedAt: stats.completedProjects >= 3 ? "2024-02-15" : undefined,
    },
    {
      id: "consistency-king",
      title: "Rei da Consistência",
      description: "Usou o app por 30 dias",
      icon: "👑",
      unlocked: stats.joinedDays >= 30,
      unlockedAt: stats.joinedDays >= 30 ? "2024-01-31" : undefined,
    },
  ]

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const achievementProgress = (unlockedAchievements.length / achievements.length) * 100

  const handleSave = async () => {
    setProfile(editedProfile)
    setIsEditing(false)
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    })

    // Atualizar perfil no Supabase
    if (user) {
      const { error } = await supabase.from("profiles").update({
        name: editedProfile?.name,
        email: editedProfile?.email,
        bio: editedProfile?.bio,
        website: editedProfile?.website,
        github: editedProfile?.github,
        linkedin: editedProfile?.linkedin,
        skills: editedProfile?.skills,
        experience: editedProfile?.experience,
        avatar_url: editedProfile?.avatar || null,
        // Remover campos que não existem na tabela: state, city, updated_at
      }).eq("id", user.id)

      if (error) {
        console.error("Erro ao atualizar perfil:", error)
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Atualizar avatar no user_metadata do Supabase Auth
      if (editedProfile?.avatar) {
        await supabase.auth.updateUser({
          data: { avatar: editedProfile.avatar }
        })
      }
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && editedProfile) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setEditedProfile({ ...editedProfile, avatar: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const addSkill = (skill: string) => {
    if (skill && editedProfile && !editedProfile.skills.includes(skill)) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, skill],
      })
      setNewSkill("")
      setShowSkillSuggestions(false)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        skills: editedProfile.skills.filter((skill) => skill !== skillToRemove),
      })
    }
  }

  const filteredSkillSuggestions = SKILL_SUGGESTIONS.filter(
    (skill) => skill.toLowerCase().includes(newSkill.toLowerCase()) && !editedProfile?.skills.includes(skill),
  ).slice(0, 8)

  const formatLocation = () => {
    // Remover referência a state e city que não existem na tabela
    return "Localização não configurada"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e acompanhe seu progresso
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Perfil */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar e Nome */}
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={editedProfile?.avatar || profile?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-3xl">{profile?.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -bottom-2 -right-2 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          value={editedProfile?.name || ""}
                          onChange={(e) => setEditedProfile(editedProfile ? { ...editedProfile, name: e.target.value } : null)}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={editedProfile?.email || ""}
                          onChange={(e) => setEditedProfile(editedProfile ? { ...editedProfile, email: e.target.value } : null)}
                          placeholder="seu@email.com"
                          type="email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience">Experiência</Label>
                        <Select
                          value={editedProfile?.experience || ""}
                          onValueChange={(value) => setEditedProfile(editedProfile ? { ...editedProfile, experience: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Iniciante">Iniciante (0-1 ano)</SelectItem>
                            <SelectItem value="Júnior">Júnior (1-3 anos)</SelectItem>
                            <SelectItem value="Pleno">Pleno (3-5 anos)</SelectItem>
                            <SelectItem value="Sênior">Sênior (5-8 anos)</SelectItem>
                            <SelectItem value="Especialista">Especialista (8+ anos)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{formatLocation()}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">
                          {profile?.experience} de experiência
                        </Badge>
                        {!roleLoading && (
                          <Badge variant={role === "admin" ? "default" : "outline"}>
                            {role === "admin" ? "👑 Administrador" : "👤 Usuário"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label>Biografia</Label>
                {isEditing ? (
                  <Textarea
                    value={editedProfile?.bio || ""}
                    onChange={(e) => setEditedProfile(editedProfile ? { ...editedProfile, bio: e.target.value } : null)}
                    placeholder="Conte um pouco sobre você, suas paixões e objetivos..."
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile?.bio}</p>
                )}
              </div>

              {/* Links Sociais */}
              <div className="space-y-4">
                <Label>Links e Redes Sociais</Label>
                <div className="grid grid-cols-1 gap-4">
                  {/* Website */}
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    {isEditing ? (
                      <Input
                        value={editedProfile?.website || ""}
                        onChange={(e) => setEditedProfile(editedProfile ? { ...editedProfile, website: e.target.value } : null)}
                        placeholder="https://seusite.com"
                        className="flex-1"
                      />
                    ) : (
                      <a
                        href={profile?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <span>{profile?.website}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center space-x-3">
                    <Github className="h-5 w-5 text-gray-500" />
                    {isEditing ? (
                      <Input
                        value={editedProfile?.github || ""}
                        onChange={(e) => setEditedProfile(editedProfile ? { ...editedProfile, github: e.target.value } : null)}
                        placeholder="https://github.com/usuario"
                        className="flex-1"
                      />
                    ) : (
                      <a
                        href={profile?.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <span>{profile?.github}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center space-x-3">
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    {isEditing ? (
                      <Input
                        value={editedProfile?.linkedin || ""}
                        onChange={(e) => setEditedProfile(editedProfile ? { ...editedProfile, linkedin: e.target.value } : null)}
                        placeholder="https://linkedin.com/in/usuario"
                        className="flex-1"
                      />
                    ) : (
                      <a
                        href={profile?.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <span>{profile?.linkedin}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Habilidades */}
              <div className="space-y-3">
                <Label>Habilidades Técnicas</Label>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {editedProfile?.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900 dark:hover:text-red-200"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Digite uma habilidade..."
                          value={newSkill}
                          onChange={(e) => {
                            setNewSkill(e.target.value)
                            setShowSkillSuggestions(e.target.value.length > 0)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addSkill(newSkill)
                            }
                          }}
                          className="flex-1"
                        />
                        <Button type="button" onClick={() => addSkill(newSkill)} disabled={!newSkill.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Sugestões */}
                      {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {filteredSkillSuggestions.map((skill) => (
                            <button
                              key={skill}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                              onClick={() => addSkill(skill)}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Clique em uma habilidade para removê-la ou digite para adicionar novas
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conquistas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Conquistas</span>
              </CardTitle>
              <CardDescription>
                {unlockedAchievements.length} de {achievements.length} conquistas desbloqueadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{Math.round(achievementProgress)}%</span>
                </div>
                <Progress value={achievementProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.unlocked
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 shadow-sm"
                        : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-60"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            achievement.unlocked
                              ? "text-green-800 dark:text-green-200"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                      {achievement.unlocked && <Award className="h-5 w-5 text-green-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Estatísticas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Projetos</span>
                  </div>
                  <span className="font-bold">{stats.totalProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Projetos Concluídos</span>
                  </div>
                  <span className="font-bold">{stats.completedProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Tarefas</span>
                  </div>
                  <span className="font-bold">{stats.totalTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Code Snippets</span>
                  </div>
                  <span className="font-bold">{stats.totalSnippets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Pomodoros</span>
                  </div>
                  <span className="font-bold">{stats.totalPomodoros}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm">Dias no DevFlow</span>
                  </div>
                  <span className="font-bold">{stats.joinedDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progresso Semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Taxa de Conclusão</span>
                    <span>
                      {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Projetos Finalizados</span>
                    <span>
                      {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nível de Produtividade */}
          <Card>
            <CardHeader>
              <CardTitle>Nível de Produtividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-blue-600">
                  Nível {Math.floor(stats.totalPomodoros / 10) + 1}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {10 - (stats.totalPomodoros % 10)} Pomodoros para o próximo nível
                </p>
                <Progress value={(stats.totalPomodoros % 10) * 10} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
