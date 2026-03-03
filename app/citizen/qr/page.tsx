"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QRCode from "@/components/qr-code"
import { QrCode, User, Mail, Phone, Award, Calendar } from "lucide-react"

export default function QRPage() {
  const { user } = useAuth()
  const citizen = user?.citizen

  if (!citizen) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No citizen data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My QR Code</h1>
        <p className="text-muted-foreground">Scan this code at smart bins to record your deposits</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4 text-primary" />
              Citizen QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <QRCode value={citizen.qr_code} size={240} />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Show this QR code at any EcoTrack smart bin
              </p>
              <p className="text-xs text-muted-foreground">
                Your deposit will be automatically tracked and points awarded
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: User, label: "Name", value: citizen.name },
              { icon: Mail, label: "Email", value: citizen.email },
              { icon: Phone, label: "Phone", value: citizen.phone || "Not set" },
              { icon: QrCode, label: "QR Code", value: citizen.qr_code },
              { icon: Award, label: "Reward Points", value: `${citizen.reward_points} pts` },
              {
                icon: Calendar,
                label: "Member Since",
                value: new Date(citizen.created_at).toLocaleDateString("en-IN", { dateStyle: "long" }),
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
