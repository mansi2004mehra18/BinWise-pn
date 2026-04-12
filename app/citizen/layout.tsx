"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import useSWR from "swr"
import {
  LayoutDashboard,
  Package,
  QrCode,
  LogOut,
  Leaf,
  ChevronRight,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Citizen } from "@/lib/types"

const citizenNavItems = [
  { href: "/citizen", label: "Dashboard", icon: LayoutDashboard },
  { href: "/citizen/deposit", label: "New Deposit", icon: Package },
  { href: "/citizen/qr", label: "My QR Code", icon: QrCode },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CitizenLayout({ children }: { children: ReactNode }) {
  const { user, login, logout, isCitizen } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [initialized, setInitialized] = useState(false)

  const { data: citizens } = useSWR<Citizen[]>("/api/citizens", fetcher)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    if (!isCitizen) {
      router.push("/")
      return
    }
    // Auto-assign first citizen if no citizen data
    if (isCitizen && !user.citizen && citizens && citizens.length > 0) {
      login("citizen", citizens[0])
    }
    setInitialized(true)
  }, [user, isCitizen, citizens, login, router])

  if (!initialized || !user || !isCitizen) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Leaf className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">BinWise</span>
        </div>

        {/* Citizen info */}
        {user.citizen && (
          <div className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                {user.citizen.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.citizen.name}</p>
                <div className="flex items-center gap-1 text-xs text-sidebar-foreground/60">
                  <Award className="h-3 w-3" />
                  {user.citizen.reward_points} pts
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 p-3">
          {citizenNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            onClick={() => {
              logout()
              router.push("/")
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">BinWise</span>
            {user.citizen && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {user.citizen.reward_points} pts
              </span>
            )}
          </div>
          <nav className="flex items-center gap-1">
            {citizenNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg p-2 ${
                  pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="sr-only">{item.label}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => {
                logout()
                router.push("/")
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign Out</span>
            </Button>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
