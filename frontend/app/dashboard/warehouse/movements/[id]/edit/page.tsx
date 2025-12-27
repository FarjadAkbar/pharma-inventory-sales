"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockMovementForm } from "@/components/warehouse/stock-movement-form"
import { warehouseApi } from "@/services"
import { toast } from "sonner"

interface StockMovement {
  id: number
  movementNumber: string
  movementType: string
  materialId: number
  materialName: string
  materialCode: string
  batchNumber: string
  quantity: number
  unit: string
  fromLocationId?: string
  toLocationId?: string
  referenceId?: string
  referenceType?: string
  remarks?: string
  performedBy?: number
  performedAt?: string
}

export default function EditMovementPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [movement, setMovement] = useState<StockMovement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovement()
  }, [id])

  const fetchMovement = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getMovementRecord(id)
      setMovement(response)
    } catch (error: any) {
      toast.error(error.message || "Failed to load stock movement")
      router.push("/dashboard/warehouse/movements")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      await warehouseApi.updateMovementRecord(id, data)
      toast.success("Stock movement updated successfully")
      router.push("/dashboard/warehouse/movements")
    } catch (error: any) {
      toast.error(error.message || "Failed to update stock movement")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/warehouse/movements")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading stock movement...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!movement) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Stock Movement</h1>
          <p className="text-muted-foreground">Update stock movement information</p>
        </div>

        <StockMovementForm
          initialData={movement}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Movement"
        />
      </div>
    </DashboardLayout>
  )
}

