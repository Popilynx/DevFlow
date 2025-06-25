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
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import { Plus, BookOpen, ExternalLink, Edit, Trash2, Search, Star, StarOff } from "lucide-react"

interface Link {
  id: string
  title: string
  url: string
  description: string
  category: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  "Documentação",
  "Tutorial",
  "Ferramenta",
  "Biblioteca",
  "Framework",
  "Blog",
  "Curso",
  "Referência",
  "Inspiração",
  "Outros",
]

const SAMPLE_LINKS = [
  {
    title: "React Documentation",
    url: "https://react.dev",
    description: "Documentação oficial do React",
    category: "Documentação",
    tags: ["react", "javascript", "frontend"],
  },
  {
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "Referência completa para tecnologias web",
    category: "Referência",
    tags: ["html", "css", "javascript", "web"],
  },
  {
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "Framework CSS utility-first",
    category: "Framework",
    tags: ["css", "tailwind", "design"],
  },
]

export function LinksView() {
  const [links, setLinks] = useLocalStorage<Link[]>("devflow_links", [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const url = formData.get("url") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const tagsString = formData.get("tags") as string
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    // Validar URL
    try {
      new URL(url)
    } catch {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      })
      return
    }

    if (editingLink) {
      setLinks(
        links.map((l) =>
          l.id === editingLink.id
            ? { ...l, title, url, description, category, tags, updatedAt: new Date().toISOString() }
            : l,
        ),
      )
      toast({
        title: "Link atualizado!",
        description: `${title} foi atualizado com sucesso.`,
      })
    } else {
      const newLink: Link = {
        id: Date.now().toString(),
        title,
        url,
        description,
        category,
        tags,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setLinks([...links, newLink])
      toast({
        title: "Link criado!",
        description: `${title} foi criado com sucesso.`,
      })
    }

    setIsDialogOpen(false)
    setEditingLink(null)
  }

  const handleDelete = (id: string) => {
    const link = links.find((l) => l.id === id)
    setLinks(links.filter((l) => l.id !== id))
    toast({
      title: "Link excluído!",
      description: `${link?.title} foi excluído.`,
      variant: "destructive",
    })
  }

  const toggleFavorite = (id: string) => {
    setLinks(
      links.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite, updatedAt: new Date().toISOString() } : l)),
    )

    const link = links.find((l) => l.id === id)
    toast({
      title: link?.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `${link?.title} ${link?.isFavorite ? "foi removido dos" : "foi adicionado aos"} favoritos.`,
    })
  }

  const addSampleLinks = () => {
    const newLinks: Link[] = SAMPLE_LINKS.map((sample, index) => ({
      id: (Date.now() + index).toString(),
      ...sample,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    setLinks([...links, ...newLinks])
    toast({
      title: "Links de exemplo adicionados!",
      description: `${newLinks.length} links foram adicionados.`,
    })
  }

  // Filtrar links
  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || link.category === selectedCategory
    const matchesFavorites = !showFavoritesOnly || link.isFavorite

    return matchesSearch && matchesCategory && matchesFavorites
  })

  // Agrupar por categoria
  const linksByCategory = filteredLinks.reduce(
    (acc, link) => {
      if (!acc[link.category]) {
        acc[link.category] = []
      }
      acc[link.category].push(link)
      return acc
    },
    {} as Record<string, Link[]>,
  )

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Documentação: "📚",
      Tutorial: "🎓",
      Ferramenta: "🔧",
      Biblioteca: "📦",
      Framework: "🏗️",
      Blog: "📝",
      Curso: "🎯",
      Referência: "📖",
      Inspiração: "💡",
      Outros: "🔗",
    }
    return icons[category] || "🔗"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Links Úteis</h1>
          <p className="text-gray-600 dark:text-gray-400">Organize e acesse rapidamente seus links favoritos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addSampleLinks}>
            Links de Exemplo
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingLink(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingLink ? "Editar Link" : "Novo Link"}</DialogTitle>
                <DialogDescription>
                  {editingLink ? "Atualize as informações do seu link." : "Adicione um novo link útil à sua coleção."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ex: React Documentation, MDN Web Docs..."
                    defaultValue={editingLink?.title || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://example.com"
                    defaultValue={editingLink?.url || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o que este link oferece..."
                    defaultValue={editingLink?.description || ""}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select name="category" defaultValue={editingLink?.category || "Documentação"}>
                    {" "}
                    {/* Updated default value */}
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryIcon(category)} {category}
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
                    placeholder="react, javascript, frontend"
                    defaultValue={editingLink?.tags.join(", ") || ""}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingLink ? "Atualizar" : "Criar"} Link</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {getCategoryIcon(category)} {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="w-full sm:w-auto"
        >
          <Star className="h-4 w-4 mr-2" />
          Favoritos
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{links.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Links</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{links.filter((l) => l.isFavorite).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Favoritos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{Object.keys(linksByCategory).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categorias</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Array.from(new Set(links.flatMap((l) => l.tags))).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tags Únicas</div>
          </CardContent>
        </Card>
      </div>

      {/* Links Content */}
      {filteredLinks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {links.length === 0 ? "Nenhum link ainda" : "Nenhum link encontrado"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {links.length === 0
                ? "Adicione seus primeiros links úteis para desenvolvimento."
                : "Tente ajustar os filtros de busca."}
            </p>
            {links.length === 0 && (
              <>
                <Button onClick={addSampleLinks} variant="outline" className="mr-2">
                  Adicionar Links de Exemplo
                </Button>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Link
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(linksByCategory).map(([category, categoryLinks]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {category}
                <Badge variant="secondary" className="ml-2">
                  {categoryLinks.length}
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryLinks.map((link) => (
                  <Card key={link.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 flex items-center">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 flex items-center"
                            >
                              {link.title}
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                          </CardTitle>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {link.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleFavorite(link.id)}>
                            {link.isFavorite ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingLink(link)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{link.description || "Sem descrição"}</CardDescription>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Adicionado em {new Date(link.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
