"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PurchaseOrderForm } from "@/components/procurement/purchase-order-form"
import { apiService } from "@/services/api.service"
import type { PurchaseOrder } from "@/types/procurement"

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: PurchaseOrder) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.createPurchaseOrder(data)
      if (response.success) {
        router.push("/dashboard/procurement/purchase-orders")
      } else {
        throw new Error(response.message || "Failed to create purchase order")
      }
    } catch (error: any) {
      console.error("Failed to create purchase order:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/procurement/purchase-orders")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
            <p className="text-muted-foreground">Create a new purchase order for procurement</p>
          </div>
        </div>

        <PurchaseOrderForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Creating..." : "Create Purchase Order"}
        />
      </div>
    </DashboardLayout>
  )
}