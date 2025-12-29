"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { manufacturingApi } from "@/services"
import { toast } from "sonner"
import { WorkOrderForm } from "@/components/manufacturing/work-order-form"
import type { WorkOrder } from "@/types/manufacturing"

export default function NewWorkOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: Partial<WorkOrder>) => {
    try {
      setLoading(true)
      const response = await manufacturingApi.createWorkOrder({
        ...data,
        createdBy: 1, // TODO: Get from auth context
      })

      if (response.success) {
        toast.success("Work order created successfully")
        router.push(`/dashboard/manufacturing/work-orders/${response.data.id}`)
      } else {
        toast.error(response.message || "Failed to create work order")
      }
    } catch (error) {
      console.error("Error creating work order:", error)
      toast.error("An error occurred while creating the work order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create Work Order</h1>
              <p className="text-muted-foreground">
                Create a new work order for manufacturing
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
            <CardDescription>
              Enter the details for the new work order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkOrderForm
              onSubmit={handleSubmit}
              loading={loading}
              submitLabel="Create Work Order"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

