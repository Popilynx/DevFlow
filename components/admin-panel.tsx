"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { UserRole } from "@/hooks/use-roles"
import { AdminOnly } from "@/components/role-guard"
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  Search,
  Crown,
  User
} from "lucide-react"

interface UserData {
  id: string
  email: string
  role: UserRole
  created_at: string
  last_sign_in_at?: string
}

export function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all")
  const { toast } = useToast()

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Buscar perfis do banco
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
      if (profilesError) throw profilesError
      setUsers(profilesData || [])
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de usuários",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // Usar a função do banco para atualizar role (mais segura)
      const { data, error } = await supabase.rpc('update_user_role', {
        user_uuid: userId,
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
          .eq("id", userId)

        if (updateError) throw updateError
      }

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      toast({
        title: "Role atualizada",
        description: `Usuário agora tem role: ${newRole}`,
      })
    } catch (error) {
      console.error("Erro ao atualizar role:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar role do usuário",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: UserRole) => {
    return role === "admin" ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    return role === "admin" ? "default" : "secondary"
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <AdminOnly>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Painel de Administração
            </CardTitle>
            <CardDescription>
              Gerencie usuários e permissões do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Total de Usuários</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Administradores</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === "admin").length}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Usuários Normais</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === "user").length}
                  </p>
                </div>
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gerenciar Usuários</CardTitle>
                <CardDescription>
                  Visualize e edite permissões dos usuários
                </CardDescription>
              </div>
              <Button onClick={loadUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar por email</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Digite o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Label htmlFor="role-filter">Filtrar por role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="user">Usuários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de usuários */}
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner className="h-8 w-8" />
                <span className="ml-2">Carregando usuários...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Criado em: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>Usuário</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center space-x-2">
                                <Crown className="h-4 w-4" />
                                <span>Admin</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  )
} 