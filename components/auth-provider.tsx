"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; needsConfirmation: boolean }>
  confirmEmail: (token: string) => Promise<boolean>
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

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; needsConfirmation: boolean }> => {
    try {
      // Determinar URL de redirecionamento baseada no ambiente
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Configurar redirecionamento para confirmação de email
          emailRedirectTo: `${baseUrl}/confirmacao`,
        },
      })

      if (error) {
        console.error("Erro no registro:", error.message)
        if (error.message.includes("User already registered")) {
          throw new Error("Este email já está cadastrado")
        }
        throw new Error(error.message)
      }

      // Se o usuário foi criado e está logado automaticamente (email confirmado)
      if (data.user && data.session) {
        setUser(data.user)
        return { success: true, needsConfirmation: false }
      }

      // Se o usuário foi criado mas precisa confirmar email
      if (data.user && !data.session) {
        console.log("Usuário criado, aguardando confirmação de email")
        return { success: true, needsConfirmation: true }
      }

      return { success: true, needsConfirmation: true }
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

  const confirmEmail = async (token: string): Promise<boolean> => {
    try {
      // Verificar OTP para confirmação de email
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      })

      if (error) {
        console.error("Erro na confirmação de email:", error.message)
        throw new Error(error.message)
      }

      if (data?.user) {
        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Erro na confirmação de email:", error)
      throw error
    }
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
        confirmEmail,
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
