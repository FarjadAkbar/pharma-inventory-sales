"use client"

import { useStore } from "@/contexts/store.context"
import { usePermissions } from "@/hooks/use-permissions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function StoreSwitcher() {
  const { stores, selectedStoreId, setSelectedStoreId } = useStore()
  const { isAdmin } = usePermissions()

  if (!isAdmin) return null

  const current = stores.find((s) => s.id === selectedStoreId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{current ? current.name : "Select store"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Stores</DropdownMenuLabel>
        {stores.map((s) => (
          <DropdownMenuItem key={s.id} onClick={() => setSelectedStoreId(s.id)}>
            {s.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


