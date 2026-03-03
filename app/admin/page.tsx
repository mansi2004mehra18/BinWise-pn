"use client"

import useSWR from "swr"
import StatCard from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trash2,
  Users,
  Package,
  AlertTriangle,
  Gauge,
  Recycle,
  TreePine,
  TrendingUp,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const WASTE_COLORS: Record<string, string> = {
  organic: "#16a34a",
  recyclable: "#0ea5e9",
  hazardous: "#dc2626",
  general: "#8b8b8b",
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useSWR("/api/stats", fetcher, {
    refreshInterval: 30000,
  })

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24 p-5" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of waste management operations across Delhi</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bins"
          value={stats.totalBins}
          icon={<Trash2 className="h-5 w-5" />}
          subtitle={`${stats.criticalBins} critical`}
          variant={stats.criticalBins > 5 ? "danger" : "default"}
        />
        <StatCard
          title="Active Citizens"
          value={stats.totalCitizens}
          icon={<Users className="h-5 w-5" />}
          subtitle={`${stats.totalPoints} total points`}
        />
        <StatCard
          title="Total Deposits"
          value={stats.totalDeposits}
          icon={<Package className="h-5 w-5" />}
          subtitle={`${stats.totalWeight} kg collected`}
        />
        <StatCard
          title="Avg Fill Level"
          value={`${stats.avgFillLevel}%`}
          icon={<Gauge className="h-5 w-5" />}
          variant={stats.avgFillLevel > 70 ? "warning" : "success"}
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Segregation Rate"
          value={`${stats.segregationRate}%`}
          icon={<Recycle className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="CO2 Saved"
          value={`${stats.totalCarbonSaved} kg`}
          icon={<TreePine className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Critical Bins"
          value={stats.criticalBins}
          icon={<AlertTriangle className="h-5 w-5" />}
          subtitle="Fill level > 80%"
          variant={stats.criticalBins > 3 ? "danger" : "warning"}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Waste Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Recycle className="h-4 w-4 text-primary" />
              Waste Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.wasteDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="weight"
                  nameKey="type"
                  label={({ type, weight }: { type: string; weight: number }) => `${type}: ${weight}kg`}
                >
                  {stats.wasteDistribution.map((entry: { type: string }) => (
                    <Cell key={entry.type} fill={WASTE_COLORS[entry.type]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Area Stats Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Avg Fill by Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.areaStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="area"
                  width={110}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Bar dataKey="avgFill" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Deposits Line */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" />
            Deposits (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.dailyDeposits}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                labelFormatter={(d: string) => new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
              />
              <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot={{ fill: "var(--primary)" }} name="Deposits" />
              <Line type="monotone" dataKey="weight" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: "var(--chart-2)" }} name="Weight (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
