import type { WasteType } from "@/lib/types"

const wasteConfig: Record<WasteType, { label: string; color: string; bgColor: string }> = {
  organic: { label: "Organic", color: "text-success", bgColor: "bg-success/15" },
  recyclable: { label: "Recyclable", color: "text-chart-4", bgColor: "bg-chart-4/15" },
  hazardous: { label: "Hazardous", color: "text-danger", bgColor: "bg-danger/15" },
  general: { label: "General", color: "text-muted-foreground", bgColor: "bg-muted" },
}

export default function WasteBadge({ type }: { type: WasteType }) {
  const config = wasteConfig[type]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  )
}

export function FillLevelBar({ level }: { level: number }) {
  const color = level >= 80 ? "bg-danger" : level >= 50 ? "bg-warning" : "bg-success"
  const textColor = level >= 80 ? "text-danger" : level >= 50 ? "text-warning" : "text-success"

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${level}%` }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>{level}%</span>
    </div>
  )
}
