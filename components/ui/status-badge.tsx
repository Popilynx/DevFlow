import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "active" | "completed" | "paused" | "pending" | "in-progress"
  className?: string
}

const statusConfig = {
  active: {
    label: "Ativo",
    className: "status-active",
  },
  completed: {
    label: "Concluído",
    className: "status-completed",
  },
  paused: {
    label: "Pausado",
    className: "status-paused",
  },
  pending: {
    label: "Pendente",
    className: "status-pending",
  },
  "in-progress": {
    label: "Em Progresso",
    className: "status-in-progress",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return <Badge className={cn(config.className, className)}>{config.label}</Badge>
}
