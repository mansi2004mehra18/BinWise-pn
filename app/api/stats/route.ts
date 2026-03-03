import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const [
    { count: totalBins },
    { count: totalCitizens },
    { count: totalDeposits },
    { data: bins },
    { data: deposits },
    { data: routes },
  ] = await Promise.all([
    supabase.from("bins").select("*", { count: "exact", head: true }),
    supabase.from("citizens").select("*", { count: "exact", head: true }),
    supabase.from("deposits").select("*", { count: "exact", head: true }),
    supabase.from("bins").select("fill_level, waste_type, area"),
    supabase.from("deposits").select("waste_type, weight_kg, points_earned, correctly_segregated, created_at"),
    supabase.from("collection_routes").select("total_distance_km, carbon_saved_kg, status"),
  ])

  const avgFillLevel = bins?.length
    ? Math.round(bins.reduce((sum, b) => sum + b.fill_level, 0) / bins.length)
    : 0

  const criticalBins = bins?.filter((b) => b.fill_level >= 80).length || 0

  const totalWeight = deposits?.reduce((sum, d) => sum + d.weight_kg, 0) || 0
  const totalPoints = deposits?.reduce((sum, d) => sum + d.points_earned, 0) || 0
  const segregationRate = deposits?.length
    ? Math.round(
        (deposits.filter((d) => d.correctly_segregated).length / deposits.length) * 100
      )
    : 0

  const totalCarbonSaved =
    routes?.reduce((sum, r) => sum + r.carbon_saved_kg, 0) || 0

  // Waste distribution
  const wasteDistribution = ["organic", "recyclable", "hazardous", "general"].map((type) => ({
    type,
    count: deposits?.filter((d) => d.waste_type === type).length || 0,
    weight: Math.round((deposits?.filter((d) => d.waste_type === type).reduce((s, d) => s + d.weight_kg, 0) || 0) * 100) / 100,
  }))

  // Area-wise bin stats
  const areas = [...new Set(bins?.map((b) => b.area) || [])]
  const areaStats = areas.map((area) => {
    const areaBins = bins?.filter((b) => b.area === area) || []
    return {
      area,
      binCount: areaBins.length,
      avgFill: Math.round(areaBins.reduce((s, b) => s + b.fill_level, 0) / areaBins.length),
    }
  })

  // Deposits per day (last 7 days)
  const now = new Date()
  const dailyDeposits = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split("T")[0]
    const dayDeposits = deposits?.filter((d) => d.created_at.split("T")[0] === dateStr) || []
    return {
      date: dateStr,
      count: dayDeposits.length,
      weight: Math.round(dayDeposits.reduce((s, d) => s + d.weight_kg, 0) * 100) / 100,
    }
  })

  return NextResponse.json({
    totalBins: totalBins || 0,
    totalCitizens: totalCitizens || 0,
    totalDeposits: totalDeposits || 0,
    avgFillLevel,
    criticalBins,
    totalWeight: Math.round(totalWeight * 100) / 100,
    totalPoints,
    segregationRate,
    totalCarbonSaved: Math.round(totalCarbonSaved * 100) / 100,
    wasteDistribution,
    areaStats,
    dailyDeposits,
  })
}
