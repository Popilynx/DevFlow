"use client"

import { useState, useEffect, useCallback } from "react"
import { storage } from "@/lib/utils"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado com lazy initialization
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storage.get(key, initialValue)
  })

  // Função para atualizar o valor
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        storage.set(key, valueToStore)
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  // Sincronizar com localStorage quando a chave muda
  useEffect(() => {
    const value = storage.get(key, initialValue)
    setStoredValue(value)
  }, [key, initialValue])

  // Listener para mudanças em outras abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key])

  return [storedValue, setValue] as const
}
