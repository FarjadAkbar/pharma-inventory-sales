"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RawMaterialForm } from "@/components/pharma/raw-material-form"
import { apiService } from "@/services/api.service"
import type { RawMaterial } from "@/types/pharma"

export default function EditRawMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const [rawMaterial, setRawMaterial] = useState<RawMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchRawMaterial(params.id as string)
    }
  }, [params.id])

  const fetchRawMaterial = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getRawMaterials({ search: id, limit: 1 })
      if (response.success && response.data?.rawMaterials?.length > 0) {
        setRawMaterial(response.data.rawMaterials[0])
      } else {
        throw new Error("Raw material not found")
      }
    } catch (error) {
      console.error("Failed to fetch raw material:", error)
      router.push("/dashboard/raw-materials")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: RawMaterial) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.updateRawMaterial({ ...data, id: params.id })
      if (response.success) {
        router.push("/dashboard/raw-materials")
      } else {
        throw new Error(response.message || "Failed to update raw material")
      }
    } catch (error: any) {
      console.error("Failed to update raw material:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/raw-materials")
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

  if (!rawMaterial) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Raw material not found</h1>
          <p className="text-muted-foreground mt-2">The raw material you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Raw Material</h1>
            <p className="text-muted-foreground">Update raw material information and specifications</p>
          </div>
        </div>

        <RawMaterialForm
          initialData={rawMaterial}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Updating..." : "Update Raw Material"}
        />
      </div>
    </DashboardLayout>
  )
}
