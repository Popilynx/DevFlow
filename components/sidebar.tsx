"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ViewType } from "@/components/dashboard"
import {
  Home,
  FolderOpen,
  CheckSquare,
  Timer,
  Code,
  BookOpen,
  LogOut,
  Menu,
  X,
  TestTube,
  User,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_CONFIG } from "@/lib/constants"

interface SidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

const menuItems = [
  { id: "overview", label: "Visão Geral", icon: Home },
  { id: "projects", label: "Projetos", icon: FolderOpen },
  { id: "tasks", label: "Tarefas", icon: CheckSquare },
  { id: "pomodoro", label: "Pomodoro", icon: Timer },
  { id: "snippets", label: "Code Snippets", icon: Code },
  { id: "links", label: "Links Úteis", icon: BookOpen },
  { id: "profile", label: "Perfil", icon: User },
  { id: "settings", label: "Configurações", icon: Settings },
] as const

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout, demoMode, disableDemoMode } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    if (demoMode) {
      disableDemoMode()
    } else {
      logout()
    }
  }

  const handleViewChange = (view: ViewType) => {
    onViewChange(view)
    setIsCollapsed(true) // Fechar menu mobile
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden no-print"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Abrir menu" : "Fechar menu"}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 custom-scrollbar overflow-y-auto",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Code className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{APP_CONFIG.name}</h1>
                {demoMode && (
                  <div className="flex items-center space-x-1 mt-1">
                    <TestTube className="h-3 w-3 text-warning" />
                    <span className="text-xs text-warning font-medium">Modo Demo</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2" role="navigation">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start space-x-3 hover-lift",
                  currentView === item.id && "gradient-primary text-primary-foreground",
                )}
                onClick={() => handleViewChange(item.id as ViewType)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Footer */}
          <footer className="p-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <Button variant="outline" size="sm" className="w-full hover-lift" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {demoMode ? "Sair do Demo" : "Logout"}
            </Button>
          </footer>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
