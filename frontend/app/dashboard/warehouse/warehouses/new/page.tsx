"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { WarehouseForm } from "@/components/warehouse/warehouse-form"
import { warehouseApi } from "@/services"
import { toast } from "sonner"

export default function NewWarehousePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await warehouseApi.createWarehouse(data)
      toast.success("Warehouse created successfully")
      router.push("/dashboard/warehouse/warehouses")
    } catch (error: any) {
      toast.error(error.message || "Failed to create warehouse")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/warehouse/warehouses")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Warehouse</h1>
          <p className="text-muted-foreground">Create a new warehouse facility</p>
        </div>

        <WarehouseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Warehouse"
        />
      </div>
    </DashboardLayout>
  )
}

