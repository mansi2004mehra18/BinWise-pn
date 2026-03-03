"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Trophy, Mail, Phone, QrCode } from "lucide-react"
import type { Citizen } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CitizensPage() {
  const { data: citizens, isLoading } = useSWR<Citizen[]>("/api/citizens", fetcher)

  const topCitizen = citizens?.[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Citizen Management</h1>
        <p className="text-muted-foreground">View and manage registered citizens and their reward points</p>
      </div>

      {/* Top Citizen Card */}
      {topCitizen && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Top Contributor</p>
              <p className="text-xl font-bold text-foreground">{topCitizen.name}</p>
              <p className="text-sm text-muted-foreground">{topCitizen.reward_points} reward points</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Citizens Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Registered Citizens ({citizens?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {citizens?.map((citizen, index) => (
                <div
                  key={citizen.id}
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{citizen.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {citizen.email}
                      </span>
                      {citizen.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {citizen.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        {citizen.qr_code}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-primary">
                      <Award className="h-3 w-3" />
                      {citizen.reward_points} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
