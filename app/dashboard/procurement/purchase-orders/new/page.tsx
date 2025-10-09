"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PurchaseOrderForm } from "@/components/procurement/purchase-order-form"

export default function NewPurchaseOrderPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard/procurement/purchase-orders")
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
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  )
}