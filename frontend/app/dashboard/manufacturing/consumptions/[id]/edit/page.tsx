"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ConsumptionForm } from "@/components/manufacturing/consumption-form"
import { manufacturingApi } from "@/services"
import { toast } from "sonner"

export default function EditConsumptionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<any>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchConsumption = async () => {
      try {
        setFetching(true)
        const response = await manufacturingApi.getMaterialConsumptionById(id)
        
        if (response.success && response.data) {
          setInitialData(response.data)
        } else {
          toast.error("Failed to load material consumption")
          router.push("/dashboard/manufacturing/consumptions")
        }
      } catch (error: any) {
        console.error("Failed to fetch material consumption:", error)
        toast.error(error.message || "Failed to load material consumption")
        router.push("/dashboard/manufacturing/consumptions")
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      fetchConsumption()
    }
  }, [id, router])

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true)
      const response = await manufacturingApi.updateMaterialConsumption(id, data)
      
      if (response.success) {
        toast.success("Material consumption updated successfully")
        router.push("/dashboard/manufacturing/consumptions")
      } else {
        toast.error(response.message || "Failed to update material consumption")
      }
    } catch (error: any) {
      console.error("Failed to update material consumption:", error)
      toast.error(error.message || "Failed to update material consumption")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Material Consumption</h1>
          <p className="text-muted-foreground">Update material consumption record</p>
        </div>

        {initialData && (
          <ConsumptionForm
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Update Consumption"
          />
        )}
      </div>
    </DashboardLayout>
  )
}

