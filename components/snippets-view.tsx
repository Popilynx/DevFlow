"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCodeSnippets } from "@/hooks/use-database"
import { useToast } from "@/hooks/use-toast"
import { generateCodeSnippet } from "@/lib/gemini"
import { Plus, Code, Copy, Edit, Trash2, Search, Sparkles } from "lucide-react"

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "dart",
  "html",
  "css",
  "scss",
  "sql",
  "bash",
  "json",
  "yaml",
  "xml",
]

const SAMPLE_PROMPTS = [
  "Função para validar email em JavaScript",
  "Hook personalizado React para localStorage",
  "Função Python para conectar com API REST",
  "Query SQL para buscar dados com JOIN",
  "Componente React de loading spinner",
  "Função para formatar data em português",
  "Middleware Express para autenticação JWT",
  "Função para debounce em JavaScript",
]

export function SnippetsView() {
  const { snippets, loading, createSnippet, updateSnippet, deleteSnippet } = useCodeSnippets()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatorPrompt, setGeneratorPrompt] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const code = formData.get("code") as string
    const language = formData.get("language") as string
    const tagsString = formData.get("tags") as string
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    try {
      if (editingSnippet) {
        await updateSnippet(editingSnippet.id, {
          title,
          description,
          code,
          language,
          tags,
        })
        toast({
          title: "Snippet atualizado!",
          description: `${title} foi atualizado com sucesso.`,
        })
      } else {
        await createSnippet({
          title,
          description,
          code,
          language,
          tags,
        })
        toast({
          title: "Snippet criado!",
          description: `${title} foi criado com sucesso.`,
        })
      }

      setIsDialogOpen(false)
      setEditingSnippet(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o snippet.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSnippet(id)
      toast({
        title: "Snippet excluído!",
        description: "O snippet foi excluído com sucesso.",
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o snippet.",
        variant: "destructive",
      })
    }
  }

  const handleCopy = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast({
        title: "Código copiado!",
        description: `${title} foi copiado para a área de transferência.`,
      })
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateSnippet = async () => {
    if (!generatorPrompt.trim()) return

    setIsGenerating(true)

    try {
      const generated = await generateCodeSnippet(generatorPrompt)

      await createSnippet({
        title: generated.title,
        description: generated.description,
        code: generated.code,
        language: generated.language,
        tags: ["gerado", "ia"],
      })

      setGeneratorPrompt("")
      toast({
        title: "✨ Snippet gerado!",
        description: "Código gerado com sucesso pela IA.",
      })
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar o código. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const addTestSnippet = async () => {
    try {
      await createSnippet({
        title: "Função de Debounce",
        description: "Função utilitária para implementar debounce em JavaScript",
        code: `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Exemplo de uso
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);`,
        language: "javascript",
        tags: ["javascript", "utility", "performance"],
      })

      toast({
        title: "Snippet de teste criado!",
        description: "Use este snippet para testar as funcionalidades.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o snippet de teste.",
        variant: "destructive",
      })
    }
  }

  // Filtrar snippets
  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage

    return matchesSearch && matchesLanguage
  })

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Code Snippets</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie e organize seus trechos de código</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addTestSnippet}>
            Snippet de Teste
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSnippet(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Snippet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSnippet ? "Editar Snippet" : "Novo Snippet"}</DialogTitle>
                <DialogDescription>
                  {editingSnippet
                    ? "Atualize as informações do seu snippet."
                    : "Crie um novo snippet de código para reutilizar."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: Função de validação, Hook customizado..."
                    defaultValue={editingSnippet?.title || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o que este código faz..."
                    defaultValue={editingSnippet?.description || ""}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Linguagem</Label>
                    <Select name="language" defaultValue={editingSnippet?.language || "javascript"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="react, hook, utility"
                      defaultValue={editingSnippet?.tags?.join(", ") || ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Textarea
                    id="code"
                    name="code"
                    placeholder="Cole seu código aqui..."
                    defaultValue={editingSnippet?.code || ""}
                    rows={10}
                    className="font-mono text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingSnippet ? "Atualizar" : "Criar"} Snippet</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gerador de Código com IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Gerador de Código IA (Gemini)</span>
          </CardTitle>
          <CardDescription>Descreva o que você precisa e deixe a IA gerar o código para você</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Ex: Função para validar email em JavaScript"
                value={generatorPrompt}
                onChange={(e) => setGeneratorPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerateSnippet()}
              />
            </div>
            <Button
              onClick={handleGenerateSnippet}
              disabled={isGenerating || !generatorPrompt.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Código
                </>
              )}
            </Button>
          </div>

          {/* Prompts de exemplo */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Exemplos de prompts:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.slice(0, 4).map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setGeneratorPrompt(prompt)}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as linguagens" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as linguagens</SelectItem>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Snippets Grid */}
      {filteredSnippets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {snippets.length === 0 ? "Nenhum snippet ainda" : "Nenhum snippet encontrado"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {snippets.length === 0
                ? "Crie seu primeiro snippet ou use o gerador de IA."
                : "Tente ajustar os filtros de busca."}
            </p>
            {snippets.length === 0 && (
              <>
                <Button onClick={addTestSnippet} variant="outline" className="mr-2">
                  Criar Snippet de Teste
                </Button>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Snippet
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSnippets.map((snippet) => (
            <Card key={snippet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{snippet.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary">{snippet.language}</Badge>
                      {snippet.tags?.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(snippet.code, snippet.title)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingSnippet(snippet)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(snippet.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{snippet.description || "Sem descrição"}</CardDescription>

                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{snippet.code}</code>
                  </pre>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Criado em {new Date(snippet.created_at).toLocaleDateString("pt-BR")}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(snippet.code, snippet.title)}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
