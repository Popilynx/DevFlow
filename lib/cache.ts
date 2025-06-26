"use client"

import React from "react"
import { storage } from "./utils"

// Tipos para o sistema de cache
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live em milissegundos
}

interface CacheConfig {
  ttl: number // Tempo padrão de vida em milissegundos
  maxSize: number // Tamanho máximo do cache
  enableCompression?: boolean
}

// Configuração padrão do cache
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 100, // Máximo 100 itens
  enableCompression: false
}

class CacheManager {
  private config: CacheConfig
  private cache: Map<string, CacheItem<any>>
  private keys: string[] // Para manter ordem LRU

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.cache = new Map()
    this.keys = []
    this.loadFromStorage()
  }

  // Carregar cache do localStorage
  private loadFromStorage() {
    try {
      const cached = storage.get<Record<string, CacheItem<any>>>("devflow_cache", {})
      const now = Date.now()
      
      // Filtrar itens expirados
      Object.entries(cached).forEach(([key, item]) => {
        if (now - item.timestamp < item.ttl) {
          this.cache.set(key, item)
          this.keys.push(key)
        }
      })
      
      console.log("📦 Cache carregado:", this.cache.size, "itens")
    } catch (error) {
      console.error("❌ Erro ao carregar cache:", error)
    }
  }

  // Salvar cache no localStorage
  private saveToStorage() {
    try {
      const cacheData: Record<string, CacheItem<any>> = {}
      this.cache.forEach((item, key) => {
        cacheData[key] = item
      })
      storage.set("devflow_cache", cacheData)
    } catch (error) {
      console.error("❌ Erro ao salvar cache:", error)
    }
  }

  // Limpar itens expirados
  private cleanup() {
    const now = Date.now()
    const expiredKeys: string[] = []

    this.cache.forEach((item, key) => {
      if (now - item.timestamp >= item.ttl) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => {
      this.cache.delete(key)
      this.keys = this.keys.filter(k => k !== key)
    })

    // Aplicar LRU se necessário
    while (this.cache.size > this.config.maxSize) {
      const oldestKey = this.keys.shift()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
  }

  // Gerar chave de cache
  private generateKey(prefix: string, params: any): string {
    const paramString = JSON.stringify(params)
    return `${prefix}:${paramString}`
  }

  // Obter item do cache
  get<T>(prefix: string, params: any = {}): T | null {
    this.cleanup()
    
    const key = this.generateKey(prefix, params)
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Mover para o final (LRU)
    this.keys = this.keys.filter(k => k !== key)
    this.keys.push(key)
    
    console.log("📦 Cache hit:", key)
    return item.data
  }

  // Definir item no cache
  set<T>(prefix: string, params: any = {}, data: T, ttl?: number): void {
    this.cleanup()
    
    const key = this.generateKey(prefix, params)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl
    }

    // Remover se já existe
    if (this.cache.has(key)) {
      this.keys = this.keys.filter(k => k !== key)
    }

    this.cache.set(key, item)
    this.keys.push(key)
    
    console.log("💾 Cache set:", key)
    this.saveToStorage()
  }

  // Invalidar cache por prefixo
  invalidate(prefix: string): void {
    const keysToRemove: string[] = []
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix + ":")) {
        keysToRemove.push(key)
      }
    })

    keysToRemove.forEach(key => {
      this.cache.delete(key)
      this.keys = this.keys.filter(k => k !== key)
    })

    console.log("🗑️ Cache invalidado:", prefix, keysToRemove.length, "itens")
    this.saveToStorage()
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear()
    this.keys = []
    storage.remove("devflow_cache")
    console.log("🧹 Cache limpo")
  }

  // Obter estatísticas do cache
  getStats() {
    this.cleanup()
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      keys: this.keys.slice(),
      config: this.config
    }
  }
}

// Instância global do cache
export const cacheManager = new CacheManager()

// Hooks para React
export function useCache<T>(
  prefix: string,
  params: any = {},
  fetcher: () => Promise<T>,
  ttl?: number
): { data: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const [data, setData] = React.useState<T | null>(() => cacheManager.get<T>(prefix, params))
  const [loading, setLoading] = React.useState(!data)
  const [error, setError] = React.useState<Error | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetcher()
      cacheManager.set(prefix, params, result, ttl)
      setData(result)
    } catch (err) {
      setError(err as Error)
      console.error("❌ Erro ao buscar dados:", err)
    } finally {
      setLoading(false)
    }
  }, [prefix, params, fetcher, ttl])

  React.useEffect(() => {
    if (!data) {
      fetchData()
    }
  }, [data, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Utilitários para cache específico
export const cacheUtils = {
  // Cache para projetos
  projects: {
    get: (userId: string) => cacheManager.get("projects", { userId }),
    set: (userId: string, data: any) => cacheManager.set("projects", { userId }, data),
    invalidate: () => cacheManager.invalidate("projects")
  },

  // Cache para tarefas
  tasks: {
    get: (userId: string) => cacheManager.get("tasks", { userId }),
    set: (userId: string, data: any) => cacheManager.set("tasks", { userId }, data),
    invalidate: () => cacheManager.invalidate("tasks")
  },

  // Cache para snippets
  snippets: {
    get: (userId: string) => cacheManager.get("snippets", { userId }),
    set: (userId: string, data: any) => cacheManager.set("snippets", { userId }, data),
    invalidate: () => cacheManager.invalidate("snippets")
  },

  // Cache para links
  links: {
    get: (userId: string) => cacheManager.get("links", { userId }),
    set: (userId: string, data: any) => cacheManager.set("links", { userId }, data),
    invalidate: () => cacheManager.invalidate("links")
  },

  // Cache para configurações do usuário
  settings: {
    get: (userId: string) => cacheManager.get("settings", { userId }),
    set: (userId: string, data: any) => cacheManager.set("settings", { userId }, data),
    invalidate: () => cacheManager.invalidate("settings")
  },

  // Cache para IA (Gemini)
  ai: {
    get: (prompt: string) => cacheManager.get("ai", { prompt }),
    set: (prompt: string, data: any) => cacheManager.set("ai", { prompt }, data, 30 * 60 * 1000), // 30 minutos
    invalidate: () => cacheManager.invalidate("ai")
  }
}

// Limpar cache automaticamente quando a sessão expira
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "devflow_cache" && e.newValue === null) {
      cacheManager.clear()
    }
  })
} 