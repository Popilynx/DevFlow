"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { storage } from "@/lib/utils"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Referência estável para initialValue
  const initialValueRef = useRef(initialValue)
  
  // Estado com lazy initialization
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storage.get(key, initialValueRef.current)
  })

  // Função para atualizar o valor
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prevValue) => {
          const valueToStore = value instanceof Function ? value(prevValue) : value
          storage.set(key, valueToStore)
          return valueToStore
        })
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key],
  )

  // Sincronizar com localStorage quando a chave muda
  useEffect(() => {
    const value = storage.get(key, initialValueRef.current)
    setStoredValue(value)
  }, [key])

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
