"use client"

import { useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Package, Trash2, CheckCircle, Award } from "lucide-react"
import { toast } from "sonner"
import type { Bin, WasteType } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DepositPage() {
  const { user, login } = useAuth()
  const { data: bins } = useSWR<Bin[]>("/api/bins", fetcher)

  const [selectedBin, setSelectedBin] = useState("")
  const [wasteType, setWasteType] = useState<WasteType>("organic")
  const [weight, setWeight] = useState("")
  const [segregated, setSegregated] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ points: number } | null>(null)

  const handleSubmit = async () => {
    if (!selectedBin || !weight || !user?.citizen) {
      toast.error("Please fill all fields")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizen_id: user.citizen.id,
          bin_id: selectedBin,
          waste_type: wasteType,
          weight_kg: parseFloat(weight),
          correctly_segregated: segregated,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to record deposit")
      } else {
        const pts = data.points_earned
        setSuccess({ points: pts })
        toast.success(`Deposit recorded! +${pts} points earned`)
        // Update user citizen data
        if (user.citizen) {
          login("citizen", {
            ...user.citizen,
            reward_points: user.citizen.reward_points + pts,
          })
        }
        // Reset form
        setSelectedBin("")
        setWeight("")
        setSegregated(true)
      }
    } catch {
      toast.error("Failed to record deposit")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Record New Deposit</h1>
        <p className="text-muted-foreground">Dispose waste properly and earn reward points</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              Deposit Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bin">Select Bin</Label>
              <Select value={selectedBin} onValueChange={setSelectedBin}>
                <SelectTrigger id="bin">
                  <SelectValue placeholder="Choose a bin..." />
                </SelectTrigger>
                <SelectContent>
                  {bins?.map((bin) => (
                    <SelectItem key={bin.id} value={bin.id}>
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          bin.fill_level >= 80 ? "bg-danger" : bin.fill_level >= 50 ? "bg-warning" : "bg-success"
                        }`} />
                        {bin.label} - {bin.area} ({bin.fill_level}%)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="waste-type">Waste Type</Label>
              <Select value={wasteType} onValueChange={(v) => setWasteType(v as WasteType)}>
                <SelectTrigger id="waste-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="recyclable">Recyclable</SelectItem>
                  <SelectItem value="hazardous">Hazardous</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                placeholder="e.g., 2.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="segregated" className="text-sm font-medium">
                  Correctly Segregated
                </Label>
                <p className="text-xs text-muted-foreground">
                  Proper segregation earns 5x more points
                </p>
              </div>
              <Switch
                id="segregated"
                checked={segregated}
                onCheckedChange={setSegregated}
              />
            </div>

            {/* Points Preview */}
            {weight && (
              <div className="rounded-lg bg-primary/5 p-3">
                <p className="text-sm text-muted-foreground">Estimated points:</p>
                <p className="text-xl font-bold text-primary">
                  +{segregated ? Math.floor(parseFloat(weight) * 10) : Math.floor(parseFloat(weight) * 2)} points
                </p>
              </div>
            )}

            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={submitting || !selectedBin || !weight}
            >
              <Trash2 className="h-4 w-4" />
              {submitting ? "Recording..." : "Record Deposit"}
            </Button>
          </CardContent>
        </Card>

        {/* Success / Info Card */}
        <div className="space-y-4">
          {success && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <CheckCircle className="h-12 w-12 text-success" />
                <h3 className="text-xl font-bold text-foreground">Deposit Recorded!</h3>
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <Award className="h-6 w-6" />
                  +{success.points} points
                </div>
                <p className="text-sm text-muted-foreground">
                  Thank you for contributing to a cleaner Delhi!
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSuccess(null)}
                  className="mt-2"
                >
                  Make Another Deposit
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Points System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Correctly segregated", points: "10 pts/kg", desc: "Waste matches bin type" },
                { label: "Not segregated", points: "2 pts/kg", desc: "Wrong bin or mixed waste" },
                { label: "Bonus: Hazardous", points: "+5 pts", desc: "Proper hazardous disposal" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{item.points}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
