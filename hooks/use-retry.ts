import { useState, useCallback } from 'react'

interface RetryConfig {
  maxAttempts?: number
  delayMs?: number
  backoffMultiplier?: number
  shouldRetry?: (error: any) => boolean
}

interface RetryState {
  isRetrying: boolean
  attempt: number
  lastError: any
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    // Retry para erros de rede, timeout, ou erros temporários do Supabase
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'ConnectionError',
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'fetch failed',
      'Failed to fetch',
      'Network request failed',
      'supabase_error',
      'JWT_EXPIRED',
      'TOKEN_REFRESH_FAILED'
    ]
    
    const errorMessage = error?.message || error?.toString() || ''
    return retryableErrors.some(retryableError => 
      errorMessage.toLowerCase().includes(retryableError.toLowerCase())
    )
  }
}

export function useRetry(config: RetryConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null
  })

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operation'
  ): Promise<T> => {
    let lastError: any = null
    
    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        setRetryState({
          isRetrying: false,
          attempt: 0,
          lastError: null
        })
        
        return await operation()
      } catch (error: any) {
        lastError = error
        
        // Verificar se deve tentar novamente
        if (attempt === finalConfig.maxAttempts || !finalConfig.shouldRetry(error)) {
          setRetryState({
            isRetrying: false,
            attempt: 0,
            lastError: error
          })
          throw error
        }
        
        // Calcular delay com backoff exponencial
        const delay = finalConfig.delayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1)
        
        setRetryState({
          isRetrying: true,
          attempt,
          lastError: error
        })
        
        console.log(`🔄 ${operationName} falhou (tentativa ${attempt}/${finalConfig.maxAttempts}). Tentando novamente em ${delay}ms...`)
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }, [finalConfig])

  const resetRetryState = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attempt: 0,
      lastError: null
    })
  }, [])

  return {
    executeWithRetry,
    resetRetryState,
    isRetrying: retryState.isRetrying,
    attempt: retryState.attempt,
    lastError: retryState.lastError,
    maxAttempts: finalConfig.maxAttempts
  }
} 