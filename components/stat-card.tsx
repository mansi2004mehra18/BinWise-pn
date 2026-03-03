import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: { value: number; label: string }
  variant?: "default" | "success" | "warning" | "danger"
}

const variantStyles = {
  default: "bg-card text-card-foreground",
  success: "bg-success/10 border-success/20",
  warning: "bg-warning/10 border-warning/20",
  danger: "bg-danger/10 border-danger/20",
}

const iconVariantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  danger: "bg-danger/20 text-danger",
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-md`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconVariantStyles[variant]}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs font-medium ${trend.value >= 0 ? "text-success" : "text-danger"}`}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
