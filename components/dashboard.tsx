"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ProjectsView } from "@/components/projects-view"
import { TasksView } from "@/components/tasks-view"
import { PomodoroView } from "@/components/pomodoro-view"
import { SnippetsView } from "@/components/snippets-view"
import { LinksView } from "@/components/links-view"
import { OverviewView } from "@/components/overview-view"
import { ProfileView } from "@/components/profile-view"
import { SettingsView } from "@/components/settings-view"
import { AdminPanel } from "@/components/admin-panel"
import { DebugPanel } from "@/components/debug-panel"

export type ViewType = "overview" | "projects" | "tasks" | "pomodoro" | "snippets" | "links" | "profile" | "settings" | "admin" | "debug"

export function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewType>("overview")

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return <OverviewView />
      case "projects":
        return <ProjectsView />
      case "tasks":
        return <TasksView />
      case "pomodoro":
        return <PomodoroView />
      case "snippets":
        return <SnippetsView />
      case "links":
        return <LinksView />
      case "profile":
        return <ProfileView />
      case "settings":
        return <SettingsView />
      case "admin":
        return <AdminPanel />
      case "debug":
        return <DebugPanel />
      default:
        return <OverviewView />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
        <Footer />
      </main>
    </div>
  )
}
