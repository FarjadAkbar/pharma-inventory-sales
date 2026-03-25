"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ShipmentItemsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/sales/shipments")
  }, [router])

  return null
}
