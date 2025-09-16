"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DrugForm } from "@/components/pharma/drug-form"
import { apiService } from "@/services/api.service"
import type { Drug } from "@/types/pharma"

export default function EditDrugPage() {
  const router = useRouter()
  const params = useParams()
  const [drug, setDrug] = useState<Drug | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchDrug(params.id as string)
    }
  }, [params.id])

  const fetchDrug = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getDrugs({ search: id, limit: 1 })
      if (response.success && response.data?.drugs?.length > 0) {
        setDrug(response.data.drugs[0])
      } else {
        throw new Error("Drug not found")
      }
    } catch (error) {
      console.error("Failed to fetch drug:", error)
      router.push("/dashboard/drugs")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Drug) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.updateDrug({ ...data, id: params.id })
      if (response.success) {
        router.push("/dashboard/drugs")
      } else {
        throw new Error(response.message || "Failed to update drug")
      }
    } catch (error: any) {
      console.error("Failed to update drug:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/drugs")
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

  if (!drug) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Drug not found</h1>
          <p className="text-muted-foreground mt-2">The drug you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Drug</h1>
            <p className="text-muted-foreground">Update drug information and specifications</p>
          </div>
        </div>

        <DrugForm
          initialData={drug}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Updating..." : "Update Drug"}
        />
      </div>
    </DashboardLayout>
  )
}
