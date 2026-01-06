"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ConsumptionForm } from "@/components/manufacturing/consumption-form"
import { manufacturingApi } from "@/services"
import { toast } from "sonner"

export default function NewConsumptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true)
      const response = await manufacturingApi.createMaterialConsumption(data.batchId, data)
      
      if (response.success) {
        toast.success("Material consumption created successfully")
        router.push("/dashboard/manufacturing/consumptions")
      } else {
        toast.error(response.message || "Failed to create material consumption")
      }
    } catch (error: any) {
      console.error("Failed to create material consumption:", error)
      toast.error(error.message || "Failed to create material consumption")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Material Consumption</h1>
          <p className="text-muted-foreground">Record material consumption for a batch</p>
        </div>

        <ConsumptionForm
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Create Consumption"
        />
      </div>
    </DashboardLayout>
  )
}

