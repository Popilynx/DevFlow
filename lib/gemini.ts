"use client"

import { PROGRAMMING_LANGUAGES } from "./constants"
import { cacheUtils } from "./cache"

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY não configurada - usando fallbacks")
}

interface GeneratedSnippet {
  title: string
  description: string
  code: string
  language: string
}

export async function generateCodeSnippet(prompt: string): Promise<GeneratedSnippet> {
  // Sanitizar prompt
  const sanitizedPrompt = prompt.trim().slice(0, 500)

  if (!sanitizedPrompt) {
    throw new Error("Prompt não pode estar vazio")
  }

  // Verificar cache primeiro
  const cached = cacheUtils.ai.get(sanitizedPrompt) as GeneratedSnippet | null
  if (cached) {
    console.log("📦 Cache hit para IA:", sanitizedPrompt)
    return cached
  }

  try {
    console.log("🚀 Gerando snippet para:", sanitizedPrompt)

    const response = await fetch("/api/generate-snippet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest", // CSRF protection
      },
      body: JSON.stringify({ prompt: sanitizedPrompt }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API error:", errorText)
      throw new Error(`API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // Validar resposta
    if (!data.title || !data.code || !data.language) {
      throw new Error("Resposta inválida da API")
    }

    // Validar linguagem
    if (!PROGRAMMING_LANGUAGES.includes(data.language.toLowerCase())) {
      data.language = "javascript" // fallback
    }

    // Salvar no cache
    cacheUtils.ai.set(sanitizedPrompt, data)

    console.log("✅ Snippet gerado:", data.title)
    return data
  } catch (error) {
    console.error("❌ Erro ao gerar snippet:", error)
    return generateFallbackSnippet(sanitizedPrompt)
  }
}

function generateFallbackSnippet(prompt: string): GeneratedSnippet {
  const promptLower = prompt.toLowerCase()

  // Fallbacks específicos baseados no prompt
  if (promptLower.includes("email") && promptLower.includes("validar")) {
    return {
      title: "Validação de Email",
      description: "Função para validar formato de email usando regex",
      code: `function validateEmail(email) {
  // Regex para validação de email
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  
  // Verificações adicionais
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Verificar comprimento
  if (email.length > 254) {
    return false;
  }
  
  return emailRegex.test(email.trim());
}

// Exemplos de uso
console.log(validateEmail('user@example.com')); // true
console.log(validateEmail('invalid-email')); // false`,
      language: "javascript",
    }
  }

  if (promptLower.includes("react") && promptLower.includes("hook")) {
    return {
      title: "Hook React Personalizado",
      description: "Hook customizado para gerenciar localStorage",
      code: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erro ao ler localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;`,
      language: "javascript",
    }
  }

  // Fallback genérico
  return {
    title: `Snippet: ${prompt}`,
    description: "Snippet gerado automaticamente (modo offline)",
    code: `// ${prompt}
// Implementação básica

function implementarFuncionalidade() {
  console.log('Implementando: ${prompt}');
  
  // TODO: Adicionar implementação específica
  return {
    success: true,
    message: 'Funcionalidade implementada',
    data: null
  };
}

// Exemplo de uso
const resultado = implementarFuncionalidade();
console.log(resultado);`,
    language: "javascript",
  }
}
