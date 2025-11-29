"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { apiService } from "@/services/api.service"
import { useAuth } from "@/contexts/auth.context"
import type { Store } from "@/types/tenant"

interface StoreContextType {
  stores: Store[]
  selectedStoreId: string | null
  setSelectedStoreId: (id: string) => void
  loading: boolean
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const setSelectedStoreId = (id: string) => {
    setSelectedStoreIdState(id)
    if (typeof window !== "undefined") localStorage.setItem("current_store_id", id)
  }

  const value = useMemo(
    () => ({
      stores,
      selectedStoreId,
      setSelectedStoreId,
      loading,
    }),
    [stores, selectedStoreId, loading],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}


