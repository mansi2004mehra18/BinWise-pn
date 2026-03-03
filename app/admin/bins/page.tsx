"use client"

import { useState } from "react"
import useSWR from "swr"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import WasteBadge, { FillLevelBar } from "@/components/waste-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Map, Filter, Trash2 } from "lucide-react"
import type { Bin, WasteType } from "@/lib/types"

const BinMap = dynamic(() => import("@/components/bin-map"), { ssr: false })

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function BinsPage() {
  const { data: bins, isLoading, mutate } = useSWR<Bin[]>("/api/bins", fetcher, {
    refreshInterval: 15000,
  })
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null)
  const [filterArea, setFilterArea] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  const areas = [...new Set(bins?.map((b) => b.area) || [])]
  const filteredBins = bins?.filter((b) => {
    if (filterArea !== "all" && b.area !== filterArea) return false
    if (filterType !== "all" && b.waste_type !== filterType) return false
    return true
  }) || []

  const handleEmptyBin = async (bin: Bin) => {
    await fetch("/api/bins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bin.id, fill_level: 0, last_emptied: new Date().toISOString() }),
    })
    mutate()
    setSelectedBin(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bin Monitor</h1>
          <p className="text-muted-foreground">Real-time bin fill levels across Delhi NCR</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
            <span className="h-2 w-2 rounded-full bg-success" /> {filteredBins.filter((b) => b.fill_level < 50).length} Low
          </Badge>
          <Badge variant="outline" className="gap-1 border-warning/30 bg-warning/10 text-warning">
            <span className="h-2 w-2 rounded-full bg-warning" /> {filteredBins.filter((b) => b.fill_level >= 50 && b.fill_level < 80).length} Moderate
          </Badge>
          <Badge variant="outline" className="gap-1 border-danger/30 bg-danger/10 text-danger">
            <span className="h-2 w-2 rounded-full bg-danger" /> {filteredBins.filter((b) => b.fill_level >= 80).length} Critical
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="organic">Organic</SelectItem>
            <SelectItem value="recyclable">Recyclable</SelectItem>
            <SelectItem value="hazardous">Hazardous</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Map className="h-4 w-4 text-primary" />
                Live Bin Map - Delhi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[500px] items-center justify-center rounded-lg bg-muted">
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              ) : (
                <BinMap
                  bins={filteredBins}
                  height="500px"
                  onBinClick={setSelectedBin}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bin List / Detail */}
        <div className="space-y-4">
          {selectedBin ? (
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{selectedBin.label}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBin(null)}>
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Area</span>
                    <span className="font-medium text-foreground">{selectedBin.area}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <WasteBadge type={selectedBin.waste_type} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium text-foreground">{selectedBin.capacity_liters}L</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Fill Level</span>
                    <FillLevelBar level={selectedBin.fill_level} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Emptied</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedBin.last_emptied).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={() => handleEmptyBin(selectedBin)}
                >
                  <Trash2 className="h-4 w-4" />
                  Mark as Emptied
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Bin list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                All Bins ({filteredBins.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] space-y-2 overflow-y-auto">
              {filteredBins.map((bin) => (
                <button
                  key={bin.id}
                  onClick={() => setSelectedBin(bin)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    selectedBin?.id === bin.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className={`h-3 w-3 rounded-full ${
                    bin.fill_level >= 80 ? "bg-danger" : bin.fill_level >= 50 ? "bg-warning" : "bg-success"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{bin.label}</p>
                    <p className="text-xs text-muted-foreground">{bin.area}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold tabular-nums ${
                      bin.fill_level >= 80 ? "text-danger" : bin.fill_level >= 50 ? "text-warning" : "text-success"
                    }`}>
                      {bin.fill_level}%
                    </p>
                    <WasteBadge type={bin.waste_type as WasteType} />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
