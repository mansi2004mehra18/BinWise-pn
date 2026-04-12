"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Leaf,
  MapPin,
  BarChart3,
  Users,
  Truck,
  Shield,
  ArrowRight,
  Recycle,
  TreePine,
  Zap,
} from "lucide-react"

export default function LandingPage() {
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = (role: "citizen" | "admin") => {
    if (role === "admin") {
      login("admin")
      router.push("/admin")
    } else {
      login("citizen")
      router.push("/citizen")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">BinWise</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
            <a href="#impact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Impact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => handleLogin("citizen")}>
              Citizen Login
            </Button>
            <Button size="sm" onClick={() => handleLogin("admin")}>
              Admin Panel
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--primary)_0%,transparent_50%)] opacity-[0.08]" />
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Waste Management
          </div>
          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            "Where {" "}
            <span className="text-primary">Waste </span>
            Meets Intelligence."  
          </h1>
    
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Real-time bin monitoring, optimized collection routes, and citizen rewards.
            BinWise transforms waste management with data-driven intelligence.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8" onClick={() => handleLogin("citizen")}>
              Get Started as Citizen
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8" onClick={() => handleLogin("admin")}>
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "20+", label: "Smart Bins" },
              { value: "5", label: "Active Citizens" },
              { value: "95%", label: "Collection Rate" },
              { value: "3.2kg", label: "CO2 Saved" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/50 bg-card py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Everything You Need for Smart Waste Management
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A comprehensive platform connecting citizens, waste collectors, and administrators.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <MapPin className="h-6 w-6" />,
                title: "Real-Time Bin Monitoring",
                desc: "Live map with fill-level indicators across Delhi. Color-coded markers show bin status at a glance.",
              },
              {
                icon: <Truck className="h-6 w-6" />,
                title: "Route Optimization",
                desc: "AI-powered nearest-neighbor algorithm creates optimal collection routes, reducing fuel costs and emissions.",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Analytics Dashboard",
                desc: "Comprehensive charts showing waste distribution, deposit trends, area performance, and segregation rates.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Citizen Rewards",
                desc: "Points-based gamification motivates proper waste segregation. Track deposits, earn points, redeem rewards.",
              },
              {
                icon: <Recycle className="h-6 w-6" />,
                title: "Waste Segregation",
                desc: "Track organic, recyclable, hazardous, and general waste separately with color-coded categorization.",
              },
              {
                icon: <TreePine className="h-6 w-6" />,
                title: "Carbon Tracking",
                desc: "Measure and display CO2 savings from optimized routes and proper waste management practices.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="group transition-all hover:shadow-lg hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              How BinWise Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Three simple steps to a cleaner city.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Scan & Deposit",
                desc: "Citizens scan their QR code at smart bins and deposit sorted waste to earn reward points.",
              },
              {
                step: "02",
                title: "Monitor & Optimize",
                desc: "Admins monitor bin fill levels in real-time and generate AI-optimized collection routes.",
              },
              {
                step: "03",
                title: "Track & Reward",
                desc: "Track environmental impact, view analytics, and reward citizens for proper segregation.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="border-t border-border/50 bg-primary py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Making Delhi Cleaner, Together
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Join the smart waste management revolution powering a sustainable future.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="gap-2" onClick={() => handleLogin("citizen")}>
              Join as Citizen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">BinWise</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Smart Waste Management Platform for Cleaner Cities
          </p>
        </div>
      </footer>
    </div>
  )
}
