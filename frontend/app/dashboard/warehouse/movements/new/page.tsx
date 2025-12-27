"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockMovementForm } from "@/components/warehouse/stock-movement-form"
import { warehouseApi } from "@/services"
import { toast } from "sonner"

export default function NewMovementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromItemId = searchParams.get('fromItem') ? parseInt(searchParams.get('fromItem')!) : undefined

  const handleSubmit = async (data: any) => {
    try {
      await warehouseApi.createMovementRecord(data)
      toast.success("Stock movement created successfully")
      router.push("/dashboard/warehouse/movements")
    } catch (error: any) {
      toast.error(error.message || "Failed to create stock movement")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/warehouse/movements")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Stock Movement</h1>
          <p className="text-muted-foreground">Record a new stock movement or transfer</p>
        </div>

        <StockMovementForm
          fromItemId={fromItemId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Movement"
        />
      </div>
    </DashboardLayout>
  )
}

