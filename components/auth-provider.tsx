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
      // Primeiro, verificar se o e-mail está confirmado
      const { data: confirmationData, error: confirmationError } = await supabase
        .from("email_confirmations")
        .select("confirmed")
        .eq("email", email)
        .single();

      // Se não encontrou confirmação, verificar se é um usuário antigo (sem confirmação)
      if (confirmationError && confirmationError.code === 'PGRST116') {
        // Usuário não encontrado na tabela de confirmação - pode ser um usuário antigo
        // Permitir login para usuários que já existiam antes da implementação da confirmação
        console.log("Usuário não encontrado na tabela de confirmação - permitindo login");
      } else if (confirmationError || !confirmationData || !confirmationData.confirmed) {
        // Usuário encontrado mas não confirmado
        throw new Error("Confirme seu e-mail antes de acessar a plataforma. Verifique sua caixa de entrada.");
      }

      // Se está confirmado ou é usuário antigo, prosseguir com o login
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
      // Criar usuário no Supabase (sem confirmação automática)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          // Não enviar emailRedirectTo, pois o envio será customizado
        },
      })

      if (error) {
        console.error("Erro no registro:", error.message)
        if (error.message.includes("User already registered")) {
          throw new Error("Este email já está cadastrado")
        }
        throw new Error(error.message)
      }

      // Se o usuário foi criado
      if (data.user) {
        // Chamar API customizada para enviar confirmação
        await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, user_id: data.user.id }),
        })
        return { success: true, needsConfirmation: true }
      }

      return { success: false, needsConfirmation: true }
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
      // Chamar API customizada para validar o token
      const res = await fetch("/api/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const result = await res.json()
      if (result.success) {
        // Token confirmado com sucesso - usuário pode fazer login agora
        return true
      } else {
        throw new Error(result.error || "Token inválido ou expirado")
      }
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
