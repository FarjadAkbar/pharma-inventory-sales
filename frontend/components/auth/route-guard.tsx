"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth.context"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  console.log("RouteGuard: pathname:", pathname, "isAuthenticated:", isAuthenticated, "loading:", loading, "user:", !!user)

  useEffect(() => {
    console.log("RouteGuard useEffect: pathname:", pathname, "isAuthenticated:", isAuthenticated, "loading:", loading)
    
    if (loading) {
      console.log("RouteGuard: Still loading, waiting...")
      return
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      console.log("RouteGuard: Not authenticated, redirecting to login")
      router.push("/auth/login")
      return
    }

    // For now, allow access to dashboard and other routes if authenticated
    // In the future, you can add more granular permission checks here
    if (pathname === "/auth/login" && isAuthenticated) {
      console.log("RouteGuard: Already authenticated, redirecting to dashboard")
      router.push("/dashboard")
      return
    }

    console.log("RouteGuard: Authentication check passed, rendering children")
  }, [isAuthenticated, loading, pathname, router])

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

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
