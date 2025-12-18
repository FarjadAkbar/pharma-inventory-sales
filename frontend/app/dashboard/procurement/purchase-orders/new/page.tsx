"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PurchaseOrderForm } from "@/components/purchase-orders/purchase-order-form"
import { purchaseOrdersApi } from "@/services"

export default function NewPurchaseOrderPage() {
  const router = useRouter()

  const handleSubmit = async (data: {
    supplierId: number
    siteId?: number
    expectedDate: string
    items: Array<{
      rawMaterialId: number
      quantity: number
      unitPrice: number
    }>
    status?: 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled'
  }) => {
    try {
      await purchaseOrdersApi.createPurchaseOrder(data)
      router.push("/dashboard/procurement/purchase-orders")
    } catch (error) {
      console.error("Failed to create purchase order:", error)
      throw error
    }
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
          submitLabel="Create Purchase Order"
        />
      </div>
    </DashboardLayout>
  )
}
