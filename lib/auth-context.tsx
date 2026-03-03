"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { AppUser, Citizen, UserRole } from "@/lib/types"

interface AuthContextType {
  user: AppUser | null
  login: (role: UserRole, citizen?: Citizen) => void
  logout: () => void
  isAdmin: boolean
  isCitizen: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)

  const login = useCallback((role: UserRole, citizen?: Citizen) => {
    setUser({ role, citizen })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext value={{
      user,
      login,
      logout,
      isAdmin: user?.role === "admin",
      isCitizen: user?.role === "citizen",
    }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
