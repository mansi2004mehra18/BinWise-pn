import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Bin } from "@/lib/types"

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Nearest-neighbor route optimization
function optimizeRoute(bins: Bin[]): { orderedBins: Bin[]; totalDistance: number } {
  if (bins.length <= 1) return { orderedBins: bins, totalDistance: 0 }

  const visited: Bin[] = [bins[0]]
  const remaining = [...bins.slice(1)]
  let totalDistance = 0

  while (remaining.length > 0) {
    const current = visited[visited.length - 1]
    let minDist = Infinity
    let nearestIdx = 0

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversine(current.lat, current.lng, remaining[i].lat, remaining[i].lng)
      if (dist < minDist) {
        minDist = dist
        nearestIdx = i
      }
    }

    totalDistance += minDist
    visited.push(remaining[nearestIdx])
    remaining.splice(nearestIdx, 1)
  }

  return { orderedBins: visited, totalDistance }
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("collection_routes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { name, fillThreshold = 70 } = body

  // Get bins above fill threshold
  const { data: bins, error: binsError } = await supabase
    .from("bins")
    .select("*")
    .gte("fill_level", fillThreshold)
    .order("fill_level", { ascending: false })

  if (binsError) {
    return NextResponse.json({ error: binsError.message }, { status: 500 })
  }

  if (!bins || bins.length === 0) {
    return NextResponse.json({ error: "No bins above threshold" }, { status: 400 })
  }

  const { orderedBins, totalDistance } = optimizeRoute(bins)
  const estimatedTime = Math.round(totalDistance * 3.5 + orderedBins.length * 5) // 3.5 min/km + 5 min/stop
  const carbonSaved = Math.round(totalDistance * 0.25 * 100) / 100 // 0.25 kg CO2/km saved vs unoptimized

  const { data: route, error: routeError } = await supabase
    .from("collection_routes")
    .insert({
      name: name || `Route ${new Date().toLocaleDateString("en-IN")}`,
      bin_ids: orderedBins.map((b) => b.id),
      total_distance_km: Math.round(totalDistance * 100) / 100,
      estimated_time_min: estimatedTime,
      carbon_saved_kg: carbonSaved,
      status: "pending",
    })
    .select()
    .single()

  if (routeError) {
    return NextResponse.json({ error: routeError.message }, { status: 500 })
  }

  return NextResponse.json({ route, bins: orderedBins })
}
