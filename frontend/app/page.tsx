"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth.context"
import { useMounted } from "@/hooks/use-mounted"

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const mounted = useMounted()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace("/dashboard")
      } else {
        router.replace("/auth/login")
      }
    }
  }, [isAuthenticated, loading, router])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
