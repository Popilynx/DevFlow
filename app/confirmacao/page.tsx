"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle, Mail, ArrowLeft, Key } from "lucide-react"
import Link from "next/link"

export default function ConfirmacaoPage() {
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const { confirmEmail } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Tentar confirmar automaticamente se houver token na URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (accessToken && refreshToken) {
      // Token já foi processado pelo Supabase, redirecionar para dashboard
      setIsConfirmed(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } else if (tokenFromUrl) {
      setToken(tokenFromUrl)
      handleConfirmToken(tokenFromUrl)
    }
  }, [searchParams, router])

  const handleConfirmToken = async (tokenToConfirm: string) => {
    if (!tokenToConfirm.trim()) {
      toast({
        title: "Token inválido",
        description: "Por favor, insira um token válido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const success = await confirmEmail(tokenToConfirm)
      
      if (success) {
        setIsConfirmed(true)
        toast({
          title: "🎉 Email confirmado com sucesso!",
          description: "Sua conta foi ativada. Redirecionando para o dashboard...",
          duration: 5000,
        })
        
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        toast({
          title: "Erro na confirmação",
          description: "Token inválido ou expirado. Verifique seu email novamente.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Erro na confirmação:", error)
      toast({
        title: "Erro na confirmação",
        description: error.message || "Token inválido ou expirado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleConfirmToken(token)
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Email Confirmado!</CardTitle>
            <CardDescription>
              Sua conta foi ativada com sucesso. Redirecionando para o dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <LoadingSpinner className="h-6 w-6 mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Confirmar Email</CardTitle>
          <CardDescription>
            Verifique sua caixa de entrada e clique no link de confirmação ou cole o token abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token de Confirmação</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="token"
                  type="text"
                  placeholder="Cole o token recebido por email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                O token foi enviado para seu email após o cadastro
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !token.trim()}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Email
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar para o login
            </Link>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Não recebeu o email?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Verifique sua pasta de spam ou solicite um novo link de confirmação fazendo login novamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 