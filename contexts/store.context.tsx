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

  useEffect(() => {
    if (!user) return
    loadStores()
  }, [user?.id])

  const loadStores = async () => {
    setLoading(true)
    try {
      const res = await apiService.getSites()
      if (res.success && res.data) {
        // Map sites data to store format
        const sites = res.data.sites || []
        const mappedStores: Store[] = sites.map((site: any) => ({
          id: site.id,
          name: site.name,
          city: site.address?.city || '',
          address: site.address ? `${site.address.street}, ${site.address.city}, ${site.address.state}` : '',
          image: '', // Sites don't have images
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        }))
        setStores(mappedStores)
        const initial =
          (typeof window !== "undefined" && localStorage.getItem("current_store_id")) ||
          (user as any)?.defaultStoreId ||
          (user as any)?.assignedStores?.[0] ||
          null
        if (initial) {
          setSelectedStoreIdState(initial)
          if (typeof window !== "undefined") localStorage.setItem("current_store_id", initial)
        }
      }
    } finally {
      setLoading(false)
    }
  }

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


