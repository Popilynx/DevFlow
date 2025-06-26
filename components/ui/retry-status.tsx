import { AlertTriangle, RefreshCw, CheckCircle } from "lucide-react"
import { Badge } from "./badge"

interface RetryStatusProps {
  isRetrying: boolean
  attempt: number
  maxAttempts: number
  lastError?: any
  operationName?: string
}

export function RetryStatus({ 
  isRetrying, 
  attempt, 
  maxAttempts, 
  lastError, 
  operationName = "Operação" 
}: RetryStatusProps) {
  if (!isRetrying && !lastError) return null

  if (isRetrying) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Tentando novamente...
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {operationName} - Tentativa {attempt} de {maxAttempts}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {attempt}/{maxAttempts}
        </Badge>
      </div>
    )
  }

  if (lastError) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            Falha após {maxAttempts} tentativas
          </p>
          <p className="text-xs text-red-700 dark:text-red-300">
            {operationName} - {lastError?.message || "Erro desconhecido"}
          </p>
        </div>
        <Badge variant="destructive" className="text-xs">
          Falhou
        </Badge>
      </div>
    )
  }

  return null
} 