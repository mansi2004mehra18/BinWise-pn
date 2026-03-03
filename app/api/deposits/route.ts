import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const citizenId = searchParams.get("citizen_id")

  let query = supabase
    .from("deposits")
    .select("*, citizen:citizens(*), bin:bins(*)")
    .order("created_at", { ascending: false })

  if (citizenId) {
    query = query.eq("citizen_id", citizenId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { citizen_id, bin_id, waste_type, weight_kg, correctly_segregated } = body

  const points = correctly_segregated ? Math.floor(weight_kg * 10) : Math.floor(weight_kg * 2)

  const { data: deposit, error: depositError } = await supabase
    .from("deposits")
    .insert({
      citizen_id,
      bin_id,
      waste_type,
      weight_kg,
      correctly_segregated,
      points_earned: points,
    })
    .select()
    .single()

  if (depositError) {
    return NextResponse.json({ error: depositError.message }, { status: 500 })
  }

  // Update citizen reward points
  const { error: citizenError } = await supabase.rpc("increment_points", {
    cid: citizen_id,
    pts: points,
  })

  // Fallback if RPC doesn't exist
  if (citizenError) {
    const { data: citizen } = await supabase
      .from("citizens")
      .select("reward_points")
      .eq("id", citizen_id)
      .single()

    if (citizen) {
      await supabase
        .from("citizens")
        .update({ reward_points: citizen.reward_points + points })
        .eq("id", citizen_id)
    }
  }

  // Update bin fill level
  const { data: bin } = await supabase
    .from("bins")
    .select("fill_level")
    .eq("id", bin_id)
    .single()

  if (bin) {
    const newFill = Math.min(100, bin.fill_level + Math.floor(weight_kg * 5))
    await supabase
      .from("bins")
      .update({ fill_level: newFill })
      .eq("id", bin_id)
  }

  return NextResponse.json(deposit)
}
