import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high"
  className?: string
}

const priorityConfig = {
  low: {
    label: "Baixa",
    className: "priority-low",
  },
  medium: {
    label: "Média",
    className: "priority-medium",
  },
  high: {
    label: "Alta",
    className: "priority-high",
  },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return <Badge className={cn(config.className, className)}>{config.label}</Badge>
}
