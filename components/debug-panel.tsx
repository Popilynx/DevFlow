"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { useRoles } from "@/hooks/use-roles"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { AdminOnly } from "@/components/role-guard"
import { 
  Bug, 
  Database, 
  User, 
  Shield, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react"

interface DebugInfo {
  user: any
  profile: any
  role: any
  error: string | null
  timestamp: string
}

export function DebugPanel() {
  const { user } = useAuth()
  const { role, loading: roleLoading, error: roleError } = useRoles()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const runDiagnostics = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Testar consulta de perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      // Testar consulta de role
      const { data: roleData, error: roleQueryError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const debugData: DebugInfo = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          user_metadata: user.user_metadata
        },
        profile: profileData,
        role: roleData,
        error: profileError?.message || roleQueryError?.message || null,
        timestamp: new Date().toISOString()
      }

      setDebugInfo(debugData)

      if (profileError || roleQueryError) {
        toast({
          title: "Erro detectado",
          description: profileError?.message || roleQueryError?.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Diagnóstico concluído",
          description: "Todas as consultas funcionaram corretamente",
        })
      }
    } catch (error) {
      console.error("Erro no diagnóstico:", error)
      toast({
        title: "Erro no diagnóstico",
        description: "Erro ao executar diagnóstico",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuário",
          email: user.email,
          role: "user",
          bio: "Desenvolvedor apaixonado por tecnologia e inovação.",
        })

      if (error) {
        toast({
          title: "Erro ao criar perfil",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Perfil criado",
          description: "Perfil criado com sucesso",
        })
        // Recarregar diagnóstico
        await runDiagnostics()
      }
    } catch (error) {
      console.error("Erro ao criar perfil:", error)
      toast({
        title: "Erro ao criar perfil",
        description: "Erro inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (hasError: boolean) => {
    return hasError ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <AdminOnly>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Painel de Debug
            </CardTitle>
            <CardDescription>
              Diagnóstico de problemas de banco de dados e autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={runDiagnostics} disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Executando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Executar Diagnóstico
                  </>
                )}
              </Button>
              <Button onClick={createProfile} variant="outline" disabled={loading}>
                <User className="mr-2 h-4 w-4" />
                Criar Perfil
              </Button>
            </div>

            {/* Informações do usuário atual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Usuário Atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs">
                    <strong>ID:</strong> {user?.id || "N/A"}
                  </div>
                  <div className="text-xs">
                    <strong>Email:</strong> {user?.email || "N/A"}
                  </div>
                  <div className="text-xs">
                    <strong>Role:</strong> 
                    {roleLoading ? (
                      <LoadingSpinner className="ml-1 h-3 w-3" />
                    ) : (
                      <Badge variant={role === "admin" ? "default" : "secondary"} className="ml-1">
                        {role || "N/A"}
                      </Badge>
                    )}
                  </div>
                  {roleError && (
                    <div className="text-xs text-red-500">
                      <strong>Erro:</strong> {roleError}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Status do Banco
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs flex items-center gap-2">
                    {getStatusIcon(!!debugInfo?.error)}
                    <span>Consulta de Perfil</span>
                  </div>
                  <div className="text-xs flex items-center gap-2">
                    {getStatusIcon(!!debugInfo?.error)}
                    <span>Consulta de Role</span>
                  </div>
                  <div className="text-xs flex items-center gap-2">
                    {getStatusIcon(!!roleError)}
                    <span>Hook useRoles</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resultados do diagnóstico */}
            {debugInfo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Resultados do Diagnóstico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {debugInfo.error ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm font-medium text-red-800">Erro Detectado:</div>
                        <div className="text-sm text-red-600 mt-1">{debugInfo.error}</div>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800">✅ Tudo funcionando!</div>
                        <div className="text-sm text-green-600 mt-1">
                          Perfil e role carregados com sucesso
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Dados do Perfil:</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(debugInfo.profile, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Dados do Role:</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(debugInfo.role, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Diagnóstico executado em: {new Date(debugInfo.timestamp).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  )
} 