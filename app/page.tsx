"use client"

import { useEffect, useState } from "react"
import { AuthProvider } from "@/components/auth-provider"
import { Dashboard } from "@/components/dashboard"
import { LandingPage } from "@/components/landing-page"
import { useAuth } from "@/components/auth-provider"
import { ErrorBoundary } from "@/components/error-boundary"

function AppContent() {
  const { user, loading, demoMode } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🔍 AppContent mounted", { user: user?.id, loading, demoMode })
  }, [user, loading, demoMode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro na Aplicação</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    )
  }

  if (user || demoMode) {
    return <Dashboard />
  }

  return <LandingPage />
}

export default function Home() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}
