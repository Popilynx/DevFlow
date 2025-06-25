"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProjectsView } from "@/components/projects-view"
import { TasksView } from "@/components/tasks-view"
import { PomodoroView } from "@/components/pomodoro-view"
import { SnippetsView } from "@/components/snippets-view"
import { LinksView } from "@/components/links-view"
import { OverviewView } from "@/components/overview-view"
import { ProfileView } from "@/components/profile-view"
import { SettingsView } from "@/components/settings-view"

export type ViewType = "overview" | "projects" | "tasks" | "pomodoro" | "snippets" | "links" | "profile" | "settings"

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
      default:
        return <OverviewView />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">{renderView()}</div>
      </main>
    </div>
  )
}
