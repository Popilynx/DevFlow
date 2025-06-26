"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { Play, Pause, Square, RotateCcw, Timer, Coffee, Target } from "lucide-react"

interface PomodoroSession {
  id: string
  date: string
  type: "work" | "break"
  duration: number
  completed: boolean
  createdAt: string
}

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
}

export function PomodoroView() {
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>("devflow_pomodoro_sessions", [])
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>("devflow_pomodoro_settings", {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  })

  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [currentType, setCurrentType] = useState<"work" | "short-break" | "long-break">("work")
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Calcular duração atual baseada no tipo
  const getCurrentDuration = () => {
    switch (currentType) {
      case "work":
        return settings.workDuration * 60
      case "short-break":
        return settings.shortBreakDuration * 60
      case "long-break":
        return settings.longBreakDuration * 60
    }
  }

  // Inicializar tempo quando o tipo muda
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getCurrentDuration())
    }
  }, [currentType, settings])

  // Timer principal
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false)

    // Salvar sessão
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      date: new Date().toDateString(),
      type: currentType === "work" ? "work" : "break",
      duration: getCurrentDuration() / 60,
      completed: true,
      createdAt: new Date().toISOString(),
    }
    setSessions((prev) => [...prev, newSession])

    // Notificação
    if (currentType === "work") {
      setCompletedSessions((prev) => prev + 1)
      toast({
        title: "🍅 Pomodoro Concluído!",
        description: "Hora de fazer uma pausa. Você merece!",
      })

      // Determinar próximo tipo de pausa
      const nextSessionCount = completedSessions + 1
      if (nextSessionCount % settings.sessionsUntilLongBreak === 0) {
        setCurrentType("long-break")
      } else {
        setCurrentType("short-break")
      }
    } else {
      toast({
        title: "☕ Pausa Concluída!",
        description: "Vamos voltar ao trabalho com energia!",
      })
      setCurrentType("work")
    }

    // Reproduzir som (simulado com vibração se disponível)
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200])
    }
  }, [currentType, settings, completedSessions, toast])

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    setTimeLeft(getCurrentDuration())
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(getCurrentDuration())
    setCompletedSessions(0)
    setCurrentType("work")
  }

  const handleSettingsUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newSettings: PomodoroSettings = {
      workDuration: Number.parseInt(formData.get("workDuration") as string),
      shortBreakDuration: Number.parseInt(formData.get("shortBreakDuration") as string),
      longBreakDuration: Number.parseInt(formData.get("longBreakDuration") as string),
      sessionsUntilLongBreak: Number.parseInt(formData.get("sessionsUntilLongBreak") as string),
    }

    setSettings(newSettings)
    setShowSettings(false)
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências de Pomodoro foram atualizadas.",
    })
  }

  // Formatação do tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Progresso em porcentagem
  const progress = ((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100

  // Estatísticas do dia
  const todaySessions = sessions.filter((s) => s.date === new Date().toDateString())
  const todayWorkSessions = todaySessions.filter((s) => s.type === "work" && s.completed)
  const todayTotalMinutes = todaySessions.reduce((acc, s) => acc + (s.completed ? s.duration : 0), 0)

  // Estatísticas da semana
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.createdAt)
    return sessionDate >= weekStart && s.completed
  })

  const getTypeIcon = () => {
    switch (currentType) {
      case "work":
        return <Target className="h-6 w-6 text-red-600" />
      case "short-break":
      case "long-break":
        return <Coffee className="h-6 w-6 text-blue-600" />
    }
  }

  const getTypeText = () => {
    switch (currentType) {
      case "work":
        return "Sessão de Trabalho"
      case "short-break":
        return "Pausa Curta"
      case "long-break":
        return "Pausa Longa"
    }
  }

  const getTypeColor = () => {
    switch (currentType) {
      case "work":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "short-break":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "long-break":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pomodoro Timer</h1>
          <p className="text-gray-600 dark:text-gray-400">Técnica de produtividade com ciclos de foco e descanso</p>
        </div>
        <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
          Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Principal */}
        <div className="lg:col-span-2">
          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getTypeIcon()}
                <Badge className={getTypeColor()}>{getTypeText()}</Badge>
              </div>
              <CardTitle className="text-6xl font-mono font-bold text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </CardTitle>
              <CardDescription>
                Sessão {completedSessions + 1} • {completedSessions} concluídas hoje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={progress} className="h-3" />

              <div className="flex justify-center space-x-4">
                {!isRunning ? (
                  <Button onClick={handleStart} size="lg" className="px-8">
                    <Play className="h-5 w-5 mr-2" />
                    Iniciar
                  </Button>
                ) : (
                  <Button onClick={handlePause} size="lg" variant="outline" className="px-8">
                    <Pause className="h-5 w-5 mr-2" />
                    Pausar
                  </Button>
                )}
                <Button onClick={handleStop} size="lg" variant="outline">
                  <Square className="h-5 w-5 mr-2" />
                  Parar
                </Button>
                <Button onClick={handleReset} size="lg" variant="outline">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Seletor de Tipo */}
              <div className="flex justify-center space-x-2">
                <Button
                  variant={currentType === "work" ? "default" : "outline"}
                  size="sm"
                  onClick={() => !isRunning && setCurrentType("work")}
                  disabled={isRunning}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Trabalho
                </Button>
                <Button
                  variant={currentType === "short-break" ? "default" : "outline"}
                  size="sm"
                  onClick={() => !isRunning && setCurrentType("short-break")}
                  disabled={isRunning}
                >
                  <Coffee className="h-4 w-4 mr-1" />
                  Pausa Curta
                </Button>
                <Button
                  variant={currentType === "long-break" ? "default" : "outline"}
                  size="sm"
                  onClick={() => !isRunning && setCurrentType("long-break")}
                  disabled={isRunning}
                >
                  <Coffee className="h-4 w-4 mr-1" />
                  Pausa Longa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Timer className="h-5 w-5" />
                <span>Hoje</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{todayWorkSessions.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pomodoros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{todayTotalMinutes}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minutos focados</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Esta Semana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {weekSessions.filter((s) => s.type === "work").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pomodoros</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {weekSessions.reduce((acc, s) => acc + s.duration, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minutos totais</div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico Recente */}
          {todaySessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sessões de Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todaySessions
                    .slice(-5)
                    .reverse()
                    .map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          {session.type === "work" ? (
                            <Target className="h-4 w-4 text-red-600" />
                          ) : (
                            <Coffee className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm">{session.type === "work" ? "Trabalho" : "Pausa"}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{session.duration}min</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Configurações */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Pomodoro</CardTitle>
            <CardDescription>Personalize os tempos de trabalho e pausa</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSettingsUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workDuration">Trabalho (min)</Label>
                  <Input
                    id="workDuration"
                    name="workDuration"
                    type="number"
                    min="1"
                    max="60"
                    defaultValue={settings.workDuration}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortBreakDuration">Pausa Curta (min)</Label>
                  <Input
                    id="shortBreakDuration"
                    name="shortBreakDuration"
                    type="number"
                    min="1"
                    max="30"
                    defaultValue={settings.shortBreakDuration}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakDuration">Pausa Longa (min)</Label>
                  <Input
                    id="longBreakDuration"
                    name="longBreakDuration"
                    type="number"
                    min="1"
                    max="60"
                    defaultValue={settings.longBreakDuration}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionsUntilLongBreak">Sessões até pausa longa</Label>
                  <Input
                    id="sessionsUntilLongBreak"
                    name="sessionsUntilLongBreak"
                    type="number"
                    min="2"
                    max="10"
                    defaultValue={settings.sessionsUntilLongBreak}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowSettings(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Configurações</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
