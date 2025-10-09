"use client"

import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PurchaseOrderForm } from "@/components/procurement/purchase-order-form"

export default function EditPurchaseOrderPage() {
  const router = useRouter()
  const params = useParams()
  const purchaseOrderId = params.id ? parseInt(params.id as string) : undefined

  const handleSuccess = () => {
    router.push("/dashboard/procurement/purchase-orders")
  }

  const handleCancel = () => {
    router.push("/dashboard/procurement/purchase-orders")
  }

  if (!purchaseOrderId) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Invalid Purchase Order ID</h1>
          <p className="text-muted-foreground mt-2">The purchase order ID is invalid.</p>
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
          purchaseOrderId={purchaseOrderId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  )
}
