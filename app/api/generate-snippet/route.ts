import { type NextRequest, NextResponse } from "next/server"
import { PROGRAMMING_LANGUAGES } from "@/lib/constants"

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 10

// Rate limiting simples (em produção, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(ip)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  userLimit.count++
  return true
}

const GEMINI_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro"]
const GEMINI_VERSIONS = ["v1beta", "v1"]

async function callGemini(prompt: string) {
  const body = {
    contents: [
      {
        parts: [
          {
            text: `Você é um assistente especializado em programação. Gere um snippet de código baseado na seguinte solicitação: "${prompt}"

Retorne APENAS um JSON válido no seguinte formato:
{
  "title": "Título conciso do snippet",
  "description": "Descrição clara do que o código faz",
  "code": "Código completo com comentários explicativos",
  "language": "linguagem de programação (javascript, python, etc.)"
}

Requisitos:
- Código funcional e comentado
- Exemplos de uso quando apropriado
- Boas práticas da linguagem
- Descrição clara e informativa
- Não inclua texto adicional, apenas o JSON.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  }

  let lastError: Error | null = null

  for (const version of GEMINI_VERSIONS) {
    for (const model of GEMINI_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`

      try {
        const res = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "DevFlow/1.0",
          },
          body: JSON.stringify(body),
        })

        if (res.ok) {
          const data = await res.json()
          return data
        } else {
          const errorText = await res.text()
          lastError = new Error(`HTTP ${res.status}: ${errorText}`)
        }
      } catch (error) {
        lastError = error as Error
      }
    }
  }

  throw lastError || new Error("Todos os modelos falharam")
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Validar Content-Type
    const contentType = request.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type deve ser application/json" }, { status: 400 })
    }

    // Validar CSRF
    const requestedWith = request.headers.get("x-requested-with")
    if (requestedWith !== "XMLHttpRequest") {
      return NextResponse.json({ error: "CSRF token inválido" }, { status: 403 })
    }

    const { prompt } = await request.json()

    // Validações de entrada
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt é obrigatório e deve ser uma string" }, { status: 400 })
    }

    if (prompt.length > 500) {
      return NextResponse.json({ error: "Prompt muito longo (máximo 500 caracteres)" }, { status: 400 })
    }

    // Sanitizar prompt
    const sanitizedPrompt = prompt.trim().replace(/[<>]/g, "")

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 500 })
    }

    const data = await callGemini(sanitizedPrompt)
    const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      throw new Error("Resposta vazia da IA")
    }

    // Extrair JSON do texto
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("JSON não encontrado na resposta")
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validar resposta
    if (!parsed.title || !parsed.code || !parsed.language) {
      throw new Error("Resposta incompleta da IA")
    }

    // Validar linguagem
    const language = parsed.language.toLowerCase()
    if (!PROGRAMMING_LANGUAGES.includes(language as any)) {
      parsed.language = "javascript" // fallback seguro
    }

    return NextResponse.json({
      title: parsed.title.slice(0, 100), // Limitar tamanho
      description: parsed.description?.slice(0, 500) || "",
      code: parsed.code.slice(0, 5000), // Limitar código
      language: parsed.language.toLowerCase(),
    })
  } catch (error: any) {
    console.error("❌ Gemini API error:", error)

    // Retornar fallback em caso de erro
    return NextResponse.json({
      title: "Snippet de Exemplo",
      description: "Snippet gerado automaticamente (modo offline)",
      code: `// Exemplo de código
function exemplo() {
  console.log('Implementar funcionalidade');
  return 'Resultado';
}`,
      language: "javascript",
    })
  }
}
