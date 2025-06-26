"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

export type UserRole = "admin" | "user"

interface ProfileData {
  id: string
  name: string
  email: string
  role: UserRole
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export function useRoles() {
  const { user } = useAuth()
  const [role, setRole] = useState<UserRole>("user")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lista de emails de administradores (configurável)
  const ADMIN_EMAILS = [
    "renato@example.com", // Substitua pelo seu email
    "admin@devflow.com",
  ]

  const loadUserRole = async () => {
    if (!user) {
      setRole("user")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Verificar se o usuário é admin baseado no email (evita recursão)
      const isAdminByEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")
      
      if (isAdminByEmail) {
        setRole("admin")
        setLoading(false)
        return
      }

      // Se não for admin por email, verificar na tabela profiles
      try {
        const { data, error: dbError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (dbError) {
          // Se houver erro, assumir que é usuário normal
          console.warn("Erro ao carregar role do banco:", dbError)
          setRole("user")
        } else if (data) {
          setRole(data.role)
        } else {
          // Criar perfil padrão se não existir
          await createUserProfile("user")
        }
      } catch (dbErr) {
        // Se houver qualquer erro na consulta, usar role padrão
        console.warn("Erro na consulta de role:", dbErr)
        setRole("user")
      }
    } catch (err: any) {
      console.error("Erro ao carregar role:", err)
      setError("Erro ao carregar permissões do usuário")
      setRole("user") // Fallback para user
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (userRole: UserRole) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuário",
          email: user.email,
          role: userRole,
          bio: "Desenvolvedor apaixonado por tecnologia e inovação.",
        })

      if (error) {
        console.warn("Erro ao criar perfil:", error)
        // Não falhar se não conseguir criar perfil
        return
      }
      
      setRole(userRole)
    } catch (err: any) {
      console.error("Erro ao criar perfil:", err)
      // Não falhar se não conseguir criar perfil
    }
  }

  const updateUserRole = async (newRole: UserRole) => {
    if (!user) return

    try {
      // Verificar se é admin por email primeiro
      const isAdminByEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")
      
      if (!isAdminByEmail && role !== "admin") {
        throw new Error("Apenas administradores podem alterar roles")
      }

      // Usar a função do banco para atualizar role (mais segura)
      const { data, error } = await supabase.rpc('update_user_role', {
        user_uuid: user.id,
        new_role: newRole
      })

      if (error) {
        // Fallback para update direto se a função não existir
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            role: newRole,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id)

        if (updateError) throw updateError
      }

      setRole(newRole)
    } catch (err: any) {
      console.error("Erro ao atualizar role:", err)
      setError("Erro ao atualizar permissões do usuário")
    }
  }

  // Verificar se o usuário tem permissão para uma funcionalidade
  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false
    
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return requiredRoles.includes(role)
  }

  // Verificar se é admin
  const isAdmin = (): boolean => {
    return hasPermission("admin")
  }

  // Verificar se é usuário normal
  const isUser = (): boolean => {
    return hasPermission(["admin", "user"])
  }

  useEffect(() => {
    loadUserRole()
  }, [user])

  return {
    role,
    loading,
    error,
    hasPermission,
    isAdmin,
    isUser,
    updateUserRole,
    refresh: loadUserRole,
  }
} 