"use client"

import { useAuth } from "@/contexts/auth.context"
import { StoreProvider } from "@/contexts/store.context"
import { usePathname } from "next/navigation"

interface ConditionalStoreProviderProps {
  children: React.ReactNode
}

export function ConditionalStoreProvider({ children }: ConditionalStoreProviderProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Don't load StoreProvider on login/auth pages
  const isAuthPage = pathname.startsWith('/auth')
  
  // Don't load StoreProvider if user is not authenticated
  const shouldLoadStores = user && !isAuthPage

  if (shouldLoadStores) {
    return <StoreProvider>{children}</StoreProvider>
  }

  // Return children without StoreProvider for auth pages or when not authenticated
  return <>{children}</>
}
