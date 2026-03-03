"use client"

import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import StatCard from "@/components/stat-card"
import WasteBadge from "@/components/waste-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Award,
  Package,
  Recycle,
  TreePine,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { Deposit, WasteType } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const WASTE_COLORS: Record<string, string> = {
  organic: "#16a34a",
  recyclable: "#0ea5e9",
  hazardous: "#dc2626",
  general: "#8b8b8b",
}

export default function CitizenDashboard() {
  const { user } = useAuth()
  const citizenId = user?.citizen?.id

  const { data: deposits, isLoading } = useSWR<Deposit[]>(
    citizenId ? `/api/deposits?citizen_id=${citizenId}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  const totalWeight = deposits?.reduce((s, d) => s + d.weight_kg, 0) || 0
  const totalPoints = deposits?.reduce((s, d) => s + d.points_earned, 0) || 0
  const segregationRate = deposits?.length
    ? Math.round((deposits.filter((d) => d.correctly_segregated).length / deposits.length) * 100)
    : 0

  const wasteBreakdown = ["organic", "recyclable", "hazardous", "general"].map((type) => ({
    name: type,
    value: deposits?.filter((d) => d.waste_type === type).length || 0,
  })).filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.citizen?.name || "Citizen"}
        </h1>
        <p className="text-muted-foreground">Your waste management activity and rewards</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Reward Points"
          value={user?.citizen?.reward_points || totalPoints}
          icon={<Award className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Total Deposits"
          value={deposits?.length || 0}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Waste Deposited"
          value={`${Math.round(totalWeight * 100) / 100} kg`}
          icon={<TreePine className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Segregation Rate"
          value={`${segregationRate}%`}
          icon={<Recycle className="h-5 w-5" />}
          variant={segregationRate >= 80 ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Waste Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              My Waste Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wasteBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={wasteBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                  >
                    {wasteBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={WASTE_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No deposits yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Deposits */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              Recent Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : deposits && deposits.length > 0 ? (
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {deposits.slice(0, 15).map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {deposit.correctly_segregated ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-danger" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {deposit.bin?.label || "Bin"}
                          </span>
                          <WasteBadge type={deposit.waste_type as WasteType} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(deposit.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{deposit.weight_kg} kg</p>
                      <Badge variant="outline" className="gap-1 border-primary/30 text-xs text-primary">
                        +{deposit.points_earned} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No deposits yet. Start disposing waste to earn points!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
