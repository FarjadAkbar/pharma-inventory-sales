"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { WarehouseForm } from "@/components/warehouse/warehouse-form"
import { warehouseApi } from "@/services"
import { toast } from "sonner"
import type { Warehouse } from "@/types/warehouse"

export default function EditWarehousePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWarehouse()
  }, [id])

  const fetchWarehouse = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getWarehouse(id)
      setWarehouse(response)
    } catch (error: any) {
      toast.error(error.message || "Failed to load warehouse")
      router.push("/dashboard/warehouse/warehouses")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      await warehouseApi.updateWarehouse(id, data)
      toast.success("Warehouse updated successfully")
      router.push("/dashboard/warehouse/warehouses")
    } catch (error: any) {
      toast.error(error.message || "Failed to update warehouse")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/warehouse/warehouses")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading warehouse...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!warehouse) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Warehouse</h1>
          <p className="text-muted-foreground">Update warehouse information</p>
        </div>

        <WarehouseForm
          initialData={warehouse}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Warehouse"
        />
      </div>
    </DashboardLayout>
  )
}

