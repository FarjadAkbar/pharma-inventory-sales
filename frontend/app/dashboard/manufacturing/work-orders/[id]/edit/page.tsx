"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { WorkOrderForm } from "@/components/manufacturing/work-order-form"
import { manufacturingApi } from "@/services"
import type { WorkOrder } from "@/types/manufacturing"
import { toast } from "sonner"

export default function EditWorkOrderPage() {
  const router = useRouter()
  const params = useParams()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchWorkOrder(params.id as string)
    }
  }, [params.id])

  const fetchWorkOrder = async (id: string) => {
    try {
      setLoading(true)
      const response = await manufacturingApi.getWorkOrder(id)
      if (response.success && response.data) {
        setWorkOrder(response.data as WorkOrder)
      } else if (response.data && !response.success) {
        setWorkOrder(response.data as WorkOrder)
      } else {
        throw new Error("Work order not found")
      }
    } catch (error) {
      console.error("Failed to fetch work order:", error)
      toast.error("Failed to load work order")
      router.push("/dashboard/manufacturing/work-orders")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Partial<WorkOrder>) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        createdBy: workOrder?.createdBy ?? 1, // preserve original creator
      }
      const response = await manufacturingApi.updateWorkOrder(params.id as string, payload)
      if (response.success) {
        toast.success("Work order updated successfully")
        router.push(`/dashboard/manufacturing/work-orders/${params.id}`)
      } else {
        throw new Error(response.message || "Failed to update work order")
      }
    } catch (error) {
      console.error("Failed to update work order:", error)
      toast.error("Failed to update work order")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/manufacturing/work-orders/${params.id}`)
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

  if (!workOrder) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Work order not found</h1>
          <p className="text-muted-foreground mt-2">The work order you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Work Order</h1>
            <p className="text-muted-foreground">Update work order details and schedule</p>
          </div>
        </div>

        <WorkOrderForm
          initialData={workOrder}
          onSubmit={handleSubmit}
          loading={isSubmitting}
          submitLabel={isSubmitting ? "Updating..." : "Update Work Order"}
        />
      </div>
    </DashboardLayout>
  )
}

