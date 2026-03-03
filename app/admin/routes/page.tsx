"use client"

import { useState } from "react"
import useSWR from "swr"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Route, Plus, Clock, MapPin, TreePine, Truck } from "lucide-react"
import type { Bin, CollectionRoute } from "@/lib/types"
import { toast } from "sonner"

const BinMap = dynamic(() => import("@/components/bin-map"), { ssr: false })

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function RoutesPage() {
  const { data: routes, isLoading: routesLoading, mutate: mutateRoutes } = useSWR<CollectionRoute[]>("/api/routes", fetcher)
  const { data: bins } = useSWR<Bin[]>("/api/bins", fetcher)
  const [generating, setGenerating] = useState(false)
  const [routeName, setRouteName] = useState("")
  const [threshold, setThreshold] = useState([70])
  const [generatedRoute, setGeneratedRoute] = useState<{ route: CollectionRoute; bins: Bin[] } | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: routeName || undefined,
          fillThreshold: threshold[0],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to generate route")
      } else {
        setGeneratedRoute(data)
        mutateRoutes()
        toast.success("Route generated successfully!")
      }
    } catch {
      toast.error("Failed to generate route")
    } finally {
      setGenerating(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-warning/15 text-warning border-warning/30",
    in_progress: "bg-chart-4/15 text-chart-4 border-chart-4/30",
    completed: "bg-success/15 text-success border-success/30",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Route Optimization</h1>
        <p className="text-muted-foreground">Generate AI-optimized collection routes for high-fill bins</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Route Generator */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-primary" />
              Generate New Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="route-name">Route Name (optional)</Label>
              <Input
                id="route-name"
                placeholder="e.g., Morning Collection"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Fill Threshold: {threshold[0]}%</Label>
              <Slider
                value={threshold}
                onValueChange={setThreshold}
                min={30}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Only include bins with fill level above this threshold
              </p>
            </div>
            {bins && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {bins.filter((b) => b.fill_level >= threshold[0]).length}
                </span>{" "}
                bins above threshold
              </p>
            )}
            <Button
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={generating}
            >
              <Route className="h-4 w-4" />
              {generating ? "Optimizing..." : "Generate Optimized Route"}
            </Button>
          </CardContent>
        </Card>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                {generatedRoute ? "Optimized Route Preview" : "Bin Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bins ? (
                <BinMap
                  bins={generatedRoute?.bins || bins.filter((b) => b.fill_level >= threshold[0])}
                  routeBins={generatedRoute?.bins}
                  height="450px"
                />
              ) : (
                <div className="flex h-[450px] items-center justify-center rounded-lg bg-muted">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Route Stats */}
          {generatedRoute && (
            <Card className="mt-4 border-success/30 bg-success/5">
              <CardContent className="flex flex-wrap items-center gap-6 p-5">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-foreground">{generatedRoute.route.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {generatedRoute.route.total_distance_km} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {generatedRoute.route.estimated_time_min} min
                  </span>
                  <span className="flex items-center gap-1">
                    <TreePine className="h-3 w-3 text-success" />
                    {generatedRoute.route.carbon_saved_kg} kg CO2 saved
                  </span>
                  <span>{generatedRoute.bins.length} stops</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Past Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Route History</CardTitle>
        </CardHeader>
        <CardContent>
          {routesLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : routes && routes.length > 0 ? (
            <div className="space-y-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{route.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(route.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{route.total_distance_km} km</span>
                    <span>{route.estimated_time_min} min</span>
                    <span className="text-success">{route.carbon_saved_kg} kg CO2</span>
                    <span>{route.bin_ids.length} bins</span>
                    <Badge variant="outline" className={statusColors[route.status]}>
                      {route.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No routes generated yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
