"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth.context"
import { usePermissions } from "@/hooks/use-permissions"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const { canAccessRoute } = usePermissions()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    // Check route permissions
    const hasAccess = canAccessRoute(pathname)

    if (!hasAccess) {
      if (pathname !== "/dashboard") {
        router.push("/dashboard")
      } else {
        router.push("/auth/login")
      }
      return
    }
  }, [isAuthenticated, loading, pathname, canAccessRoute, router, user?.role])

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

  // Don't render if not authenticated or no access
  if (!isAuthenticated || !canAccessRoute(pathname)) {
    return null
  }

  return <>{children}</>
}
