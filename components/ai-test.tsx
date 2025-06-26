"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { generateCodeSnippet } from "@/lib/gemini"
import { useToast } from "@/hooks/use-toast"
import { Bot, Code, Copy, Check } from "lucide-react"

interface GeneratedSnippet {
  title: string
  description: string
  code: string
  language: string
}

export function AITest() {
  const [prompt, setPrompt] = useState("")
  const [generatedSnippet, setGeneratedSnippet] = useState<GeneratedSnippet | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt vazio",
        description: "Digite um prompt para gerar o snippet.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setGeneratedSnippet(null)
      
      const snippet = await generateCodeSnippet(prompt)
      setGeneratedSnippet(snippet)
      
      toast({
        title: "Snippet gerado!",
        description: "Snippet criado com sucesso pela IA.",
      })
    } catch (error) {
      console.error("Erro ao gerar snippet:", error)
      toast({
        title: "Erro ao gerar",
        description: "Erro ao gerar snippet. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!generatedSnippet) return
    
    try {
      await navigator.clipboard.writeText(generatedSnippet.code)
      setCopied(true)
      toast({
        title: "Copiado!",
        description: "Código copiado para a área de transferência.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Erro ao copiar para a área de transferência.",
        variant: "destructive",
      })
    }
  }

  const examples = [
    "Função para validar email",
    "Hook React para localStorage",
    "Componente de loading",
    "Função para formatar data",
    "Validação de formulário",
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Teste da IA - Gemini
          </CardTitle>
          <CardDescription>
            Teste a geração de snippets de código usando IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt para IA</Label>
            <Textarea
              id="prompt"
              placeholder="Descreva o que você quer que a IA gere..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(example)}
              >
                {example}
              </Button>
            ))}
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Gerando...
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Gerar Snippet
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedSnippet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{generatedSnippet.title}</CardTitle>
                <CardDescription>{generatedSnippet.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{generatedSnippet.language}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generatedSnippet.code}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Status da IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>API Key configurada:</span>
              <Badge variant={process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "default" : "destructive"}>
                {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "Sim" : "Não"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Endpoint da API:</span>
              <Badge variant="secondary">/api/generate-snippet</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Cache ativo:</span>
              <Badge variant="default">Sim</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 