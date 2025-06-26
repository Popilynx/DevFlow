"use client"

import { Code, Home, FolderOpen, CheckSquare, Timer, BookOpen, User, Settings, Heart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navigationLinks = [
    { href: "/", label: "Visão Geral", icon: Home },
    { href: "/projects", label: "Projetos", icon: FolderOpen },
    { href: "/tasks", label: "Tarefas", icon: CheckSquare },
    { href: "/pomodoro", label: "Pomodoro", icon: Timer },
    { href: "/snippets", label: "Snippets", icon: Code },
    { href: "/links", label: "Links", icon: BookOpen },
    { href: "/profile", label: "Perfil", icon: User },
    { href: "/settings", label: "Configurações", icon: Settings },
  ]

  return (
    <footer className="border-t bg-card/70 backdrop-blur-sm">
      <div className="container mx-auto px-2 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-2 md:mb-3 items-start">
          {/* Logo e descrição */}
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Code className="h-4 w-4 text-primary" />
              <span className="text-base font-bold">DevFlow</span>
            </div>
            <p className="text-xs text-muted-foreground leading-snug max-w-[180px]">
              Plataforma para desenvolvedores organizarem projetos e tarefas.
            </p>
            <ThemeToggle />
          </div>

          {/* Navegação rápida */}
          <div className="space-y-1">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Navegação</h3>
            <nav className="space-y-1">
              {navigationLinks.slice(0, 4).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <link.icon className="h-3 w-3 group-hover:text-primary transition-colors" />
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Mais links */}
          <div className="space-y-1">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Ferramentas</h3>
            <nav className="space-y-1">
              {navigationLinks.slice(4).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <link.icon className="h-3 w-3 group-hover:text-primary transition-colors" />
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Informações */}
          <div className="space-y-1">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Sobre</h3>
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <p>v1.0.0</p>
              <p>Next.js • Supabase</p>
            </div>
          </div>
        </div>

        {/* Linha separadora */}
        <div className="border-t border-border/50 my-2" />

        {/* Copyright e links */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-1 md:space-y-0">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>© {currentYear} DevFlow</span>
            <span>•</span>
            <span>Criado por</span>
            <a
              href="https://www.linkedin.com/in/renato-rocha-de-souza-júnior-775b48149/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent font-medium hover:underline"
            >
              Renato Rocha de Souza Junior
            </a>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacidade</a>
            <span>•</span>
            <a href="/terms" className="hover:text-foreground transition-colors">Termos</a>
            <span>•</span>
            <a href="/support" className="hover:text-foreground transition-colors">Suporte</a>
          </div>
        </div>
      </div>
    </footer>
  )
} 