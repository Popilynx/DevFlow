"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  Palette,
  Bell,
  Timer,
  Download,
  Upload,
  Trash2,
  Shield,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  AlertTriangle,
} from "lucide-react"

interface NotificationSettings {
  pomodoroComplete: boolean
  taskReminders: boolean
  projectDeadlines: boolean
  dailySummary: boolean
  soundEnabled: boolean
  volume: number
}

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

interface AppSettings {
  language: string
  dateFormat: string
  timeFormat: string
  startOfWeek: string
  autoSave: boolean
  compactMode: boolean
}

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>("devflow_notifications", {
    pomodoroComplete: true,
    taskReminders: true,
    projectDeadlines: true,
    dailySummary: false,
    soundEnabled: true,
    volume: 50,
  })

  const [pomodoroSettings, setPomodoroSettings] = useLocalStorage<PomodoroSettings>("devflow_pomodoro_settings", {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  })

  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>("devflow_app_settings", {
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    startOfWeek: "monday",
    autoSave: true,
    compactMode: false,
  })

  const [showDangerZone, setShowDangerZone] = useState(false)

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean | number) => {
    setNotifications({ ...notifications, [key]: value })
    toast({
      title: "Configuração atualizada",
      description: "Suas preferências de notificação foram salvas.",
    })
  }

  const handlePomodoroChange = (key: keyof PomodoroSettings, value: number | boolean) => {
    setPomodoroSettings({ ...pomodoroSettings, [key]: value })
    toast({
      title: "Configuração do Pomodoro atualizada",
      description: "Suas preferências foram salvas.",
    })
  }

  const handleAppSettingChange = (key: keyof AppSettings, value: string | boolean) => {
    setAppSettings({ ...appSettings, [key]: value })
    toast({
      title: "Configuração do aplicativo atualizada",
      description: "Suas preferências foram salvas.",
    })
  }

  const exportData = () => {
    const data = {
      projects: localStorage.getItem("devflow_projects"),
      tasks: localStorage.getItem("devflow_tasks"),
      snippets: localStorage.getItem("devflow_snippets"),
      links: localStorage.getItem("devflow_links"),
      pomodoroSessions: localStorage.getItem("devflow_pomodoro_sessions"),
      profile: localStorage.getItem("devflow_profile"),
      settings: {
        notifications,
        pomodoro: pomodoroSettings,
        app: appSettings,
      },
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `devflow-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Backup criado!",
      description: "Seus dados foram exportados com sucesso.",
    })
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Restaurar dados
        if (data.projects) localStorage.setItem("devflow_projects", data.projects)
        if (data.tasks) localStorage.setItem("devflow_tasks", data.tasks)
        if (data.snippets) localStorage.setItem("devflow_snippets", data.snippets)
        if (data.links) localStorage.setItem("devflow_links", data.links)
        if (data.pomodoroSessions) localStorage.setItem("devflow_pomodoro_sessions", data.pomodoroSessions)
        if (data.profile) localStorage.setItem("devflow_profile", data.profile)

        // Restaurar configurações
        if (data.settings) {
          if (data.settings.notifications) setNotifications(data.settings.notifications)
          if (data.settings.pomodoro) setPomodoroSettings(data.settings.pomodoro)
          if (data.settings.app) setAppSettings(data.settings.app)
        }

        toast({
          title: "Dados restaurados!",
          description: "Seus dados foram importados com sucesso.",
        })

        // Recarregar a página para aplicar as mudanças
        setTimeout(() => window.location.reload(), 1000)
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Arquivo inválido ou corrompido.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    const keys = [
      "devflow_projects",
      "devflow_tasks",
      "devflow_snippets",
      "devflow_links",
      "devflow_pomodoro_sessions",
      "devflow_profile",
      "devflow_notifications",
      "devflow_pomodoro_settings",
      "devflow_app_settings",
    ]

    keys.forEach((key) => localStorage.removeItem(key))

    toast({
      title: "Dados limpos!",
      description: "Todos os seus dados foram removidos.",
      variant: "destructive",
    })

    // Recarregar a página
    setTimeout(() => window.location.reload(), 1000)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">Personalize sua experiência no DevFlow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Aparência</span>
            </CardTitle>
            <CardDescription>Personalize a aparência do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      {getThemeIcon()}
                      <span className="capitalize">
                        {theme === "system" ? "Sistema" : theme === "light" ? "Claro" : "Escuro"}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Claro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Escuro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>Sistema</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Compacto</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interface mais densa com menos espaçamento</p>
              </div>
              <Switch
                checked={appSettings.compactMode}
                onCheckedChange={(checked) => handleAppSettingChange("compactMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notificações</span>
            </CardTitle>
            <CardDescription>Configure quando receber notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Pomodoro Concluído</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar quando uma sessão terminar</p>
              </div>
              <Switch
                checked={notifications.pomodoroComplete}
                onCheckedChange={(checked) => handleNotificationChange("pomodoroComplete", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes de Tarefas</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lembrar de tarefas próximas do prazo</p>
              </div>
              <Switch
                checked={notifications.taskReminders}
                onCheckedChange={(checked) => handleNotificationChange("taskReminders", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prazos de Projetos</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar sobre prazos de projetos</p>
              </div>
              <Switch
                checked={notifications.projectDeadlines}
                onCheckedChange={(checked) => handleNotificationChange("projectDeadlines", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resumo Diário</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receber resumo das atividades do dia</p>
              </div>
              <Switch
                checked={notifications.dailySummary}
                onCheckedChange={(checked) => handleNotificationChange("dailySummary", checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sons</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reproduzir sons de notificação</p>
                </div>
                <Switch
                  checked={notifications.soundEnabled}
                  onCheckedChange={(checked) => handleNotificationChange("soundEnabled", checked)}
                />
              </div>

              {notifications.soundEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {notifications.volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <Label>Volume: {notifications.volume}%</Label>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={notifications.volume}
                    onChange={(e) => handleNotificationChange("volume", Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Pomodoro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span>Pomodoro</span>
            </CardTitle>
            <CardDescription>Configure os tempos e comportamentos do Pomodoro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trabalho (min)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={pomodoroSettings.workDuration}
                  onChange={(e) => handlePomodoroChange("workDuration", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Pausa Curta (min)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={pomodoroSettings.shortBreakDuration}
                  onChange={(e) => handlePomodoroChange("shortBreakDuration", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Pausa Longa (min)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={pomodoroSettings.longBreakDuration}
                  onChange={(e) => handlePomodoroChange("longBreakDuration", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Sessões até pausa longa</Label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  value={pomodoroSettings.sessionsUntilLongBreak}
                  onChange={(e) => handlePomodoroChange("sessionsUntilLongBreak", Number.parseInt(e.target.value))}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-iniciar Pausas</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Iniciar pausas automaticamente</p>
              </div>
              <Switch
                checked={pomodoroSettings.autoStartBreaks}
                onCheckedChange={(checked) => handlePomodoroChange("autoStartBreaks", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-iniciar Pomodoros</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Iniciar sessões de trabalho automaticamente</p>
              </div>
              <Switch
                checked={pomodoroSettings.autoStartPomodoros}
                onCheckedChange={(checked) => handlePomodoroChange("autoStartPomodoros", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Geral</span>
            </CardTitle>
            <CardDescription>Configurações gerais do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select value={appSettings.language} onValueChange={(value) => handleAppSettingChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Formato de Data</Label>
                <Select
                  value={appSettings.dateFormat}
                  onValueChange={(value) => handleAppSettingChange("dateFormat", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Formato de Hora</Label>
                <Select
                  value={appSettings.timeFormat}
                  onValueChange={(value) => handleAppSettingChange("timeFormat", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="12h">12 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Início da Semana</Label>
              <Select
                value={appSettings.startOfWeek}
                onValueChange={(value) => handleAppSettingChange("startOfWeek", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Segunda-feira</SelectItem>
                  <SelectItem value="sunday">Domingo</SelectItem>
                  <SelectItem value="saturday">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Salvamento Automático</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Salvar alterações automaticamente</p>
              </div>
              <Switch
                checked={appSettings.autoSave}
                onCheckedChange={(checked) => handleAppSettingChange("autoSave", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup e Restauração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Backup e Restauração</span>
          </CardTitle>
          <CardDescription>Faça backup dos seus dados ou restaure de um backup anterior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={exportData} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
            <div className="flex-1">
              <Input type="file" accept=".json" onChange={importData} className="hidden" id="import-file" />
              <Button asChild variant="outline" className="w-full">
                <label htmlFor="import-file" className="cursor-pointer flex items-center justify-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </label>
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            O backup inclui todos os seus projetos, tarefas, snippets, links e configurações.
          </p>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Zona de Perigo</span>
          </CardTitle>
          <CardDescription>Ações irreversíveis que afetam seus dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Limpar Todos os Dados</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remove permanentemente todos os seus dados do aplicativo
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDangerZone(!showDangerZone)}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              {showDangerZone ? "Cancelar" : "Mostrar"}
            </Button>
          </div>

          {showDangerZone && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-600">Atenção!</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Esta ação não pode ser desfeita. Todos os seus projetos, tarefas, snippets, links e configurações serão
                permanentemente removidos.
              </p>
              <Button onClick={clearAllData} variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmar Limpeza de Dados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
