"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  demoMode: boolean
  enableDemoMode: () => void
  disableDemoMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Verificar modo demo
    const savedDemoMode = localStorage.getItem("devflow_demo_mode")
    if (savedDemoMode === "true") {
      setDemoMode(true)
    }

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erro no login:", error.message)
        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou senha incorretos")
        }
        throw new Error(error.message)
      }

      return true
    } catch (error) {
      console.error("Erro no login:", error)
      throw error // Re-throw para o componente tratar
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Configurar para não precisar de confirmação de email em desenvolvimento
          emailRedirectTo: undefined,
        },
      })

      if (error) {
        console.error("Erro no registro:", error.message)
        if (error.message.includes("User already registered")) {
          throw new Error("Este email já está cadastrado")
        }
        throw new Error(error.message)
      }

      // Se o usuário foi criado e está logado automaticamente
      if (data.user && data.session) {
        setUser(data.user)
        return true
      }

      // Se precisar de confirmação de email, tentar fazer login automaticamente
      if (data.user && !data.session) {
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (loginError) {
            // Se não conseguir fazer login automático, ainda é sucesso no registro
            console.log("Usuário criado, mas precisa confirmar email")
            return true
          }

          if (loginData.user) {
            setUser(loginData.user)
          }
        } catch (loginError) {
          console.log("Erro no login automático:", loginError)
          // Ainda é sucesso no registro, mesmo que o login automático falhe
        }
      }

      return true
    } catch (error) {
      console.error("Erro no registro:", error)
      throw error
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setDemoMode(false)
    localStorage.removeItem("devflow_demo_mode")
  }

  const enableDemoMode = () => {
    setDemoMode(true)
    localStorage.setItem("devflow_demo_mode", "true")
  }

  const disableDemoMode = () => {
    setDemoMode(false)
    localStorage.removeItem("devflow_demo_mode")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        demoMode,
        enableDemoMode,
        disableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
