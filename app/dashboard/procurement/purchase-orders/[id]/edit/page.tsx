"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PurchaseOrderForm } from "@/components/procurement/purchase-order-form"
import { apiService } from "@/services/api.service"
import type { PurchaseOrder } from "@/types/procurement"

export default function EditPurchaseOrderPage() {
  const router = useRouter()
  const params = useParams()
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPurchaseOrder(params.id as string)
    }
  }, [params.id])

  const fetchPurchaseOrder = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getPurchaseOrders({ search: id, limit: 1 })
      if (response.success && response.data?.purchaseOrders?.length > 0) {
        setPurchaseOrder(response.data.purchaseOrders[0])
      } else {
        throw new Error("Purchase order not found")
      }
    } catch (error) {
      console.error("Failed to fetch purchase order:", error)
      router.push("/dashboard/procurement/purchase-orders")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: PurchaseOrder) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.updatePurchaseOrder({ ...data, id: params.id })
      if (response.success) {
        router.push("/dashboard/procurement/purchase-orders")
      } else {
        throw new Error(response.message || "Failed to update purchase order")
      }
    } catch (error: any) {
      console.error("Failed to update purchase order:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/procurement/purchase-orders")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!purchaseOrder) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Purchase order not found</h1>
          <p className="text-muted-foreground mt-2">The purchase order you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Purchase Order</h1>
            <p className="text-muted-foreground">Update purchase order information and items</p>
          </div>
        </div>

        <PurchaseOrderForm
          initialData={purchaseOrder}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Updating..." : "Update Purchase Order"}
        />
      </div>
    </DashboardLayout>
  )
}
