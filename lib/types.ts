export type WasteType = "organic" | "recyclable" | "hazardous" | "general"
export type RouteStatus = "pending" | "in_progress" | "completed"

export interface Citizen {
  id: string
  name: string
  email: string
  phone: string | null
  qr_code: string
  reward_points: number
  created_at: string
}

export interface Bin {
  id: string
  label: string
  lat: number
  lng: number
  fill_level: number
  waste_type: WasteType
  area: string
  capacity_liters: number
  last_emptied: string
  created_at: string
}

export interface Deposit {
  id: string
  citizen_id: string
  bin_id: string
  waste_type: WasteType
  weight_kg: number
  correctly_segregated: boolean
  points_earned: number
  created_at: string
  citizen?: Citizen
  bin?: Bin
}

export interface CollectionRoute {
  id: string
  name: string
  bin_ids: string[]
  total_distance_km: number
  estimated_time_min: number
  carbon_saved_kg: number
  status: RouteStatus
  created_at: string
  bins?: Bin[]
}

export type UserRole = "citizen" | "admin"

export interface AppUser {
  role: UserRole
  citizen?: Citizen
}
