"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth.context"
import { authService } from "@/services/auth.service"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  // Treat as authenticated if context says so OR we have a valid token (avoids redirect race right after login)
  const authenticated = isAuthenticated || authService.isAuthenticated()

  useEffect(() => {
    if (loading) return

    if (!authenticated) {
      router.push("/auth/login")
      return
    }

    if (pathname === "/auth/login" && authenticated) {
      router.push("/dashboard")
      return
    }
  }, [authenticated, loading, pathname, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) return null

  return <>{children}</>
}
