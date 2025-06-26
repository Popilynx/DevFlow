"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cacheManager } from "@/lib/cache"
import { Database, Trash2, RefreshCw, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CacheStats() {
  const [stats, setStats] = useState(cacheManager.getStats())
  const { toast } = useToast()

  const refreshStats = () => {
    setStats(cacheManager.getStats())
  }

  const clearCache = () => {
    cacheManager.clear()
    refreshStats()
    toast({
      title: "Cache limpo!",
      description: "Todos os dados em cache foram removidos.",
    })
  }

  useEffect(() => {
    // Atualizar stats a cada 5 segundos
    const interval = setInterval(refreshStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const cacheItems = [
    { name: "Projetos", key: "projects" },
    { name: "Tarefas", key: "tasks" },
    { name: "Snippets", key: "snippets" },
    { name: "Links", key: "links" },
    { name: "Configurações", key: "settings" },
    { name: "IA (Gemini)", key: "ai" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas do Cache
          </CardTitle>
          <CardDescription>
            Monitoramento do sistema de cache para melhor performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Itens em Cache</p>
                <p className="text-2xl font-bold">{stats.size}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Limite Máximo</p>
                <p className="text-2xl font-bold">{stats.maxSize}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">TTL Padrão</p>
                <p className="text-2xl font-bold">{Math.round(stats.config.ttl / 1000 / 60)}m</p>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Itens por Categoria</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {cacheItems.map((item) => {
                const count = stats.keys.filter(key => key.startsWith(item.key + ":")).length
                return (
                  <div key={item.key} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{item.name}</span>
                    <Badge variant={count > 0 ? "default" : "secondary"}>
                      {count}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={refreshStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={clearCache} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 