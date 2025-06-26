"use client"

import { ReactNode } from "react"
import { useRoles, UserRole } from "@/hooks/use-roles"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle } from "lucide-react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole | UserRole[]
  fallback?: ReactNode
  showLoading?: boolean
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  fallback,
  showLoading = true 
}: RoleGuardProps) {
  const { hasPermission, loading, error } = useRoles()

  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner className="h-8 w-8" />
        <span className="ml-2">Verificando permissões...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao verificar permissões: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!hasPermission(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta funcionalidade.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Componente específico para funcionalidades de admin
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard requiredRole="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

// Componente para funcionalidades de usuário (admin + user)
export function UserOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard requiredRole={["admin", "user"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
} 