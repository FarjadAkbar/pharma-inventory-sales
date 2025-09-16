"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BOMForm } from "@/components/manufacturing/bom-form"
import { apiService } from "@/services/api.service"
import type { BOM } from "@/types/manufacturing"

export default function EditBOMPage() {
  const router = useRouter()
  const params = useParams()
  const [bom, setBOM] = useState<BOM | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchBOM(params.id as string)
    }
  }, [params.id])

  const fetchBOM = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getBOMs({ search: id, limit: 1 })
      if (response.success && response.data?.boms?.length > 0) {
        setBOM(response.data.boms[0])
      } else {
        throw new Error("BOM not found")
      }
    } catch (error) {
      console.error("Failed to fetch BOM:", error)
      router.push("/dashboard/manufacturing/boms")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: BOM) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.updateBOM({ ...data, id: params.id })
      if (response.success) {
        router.push("/dashboard/manufacturing/boms")
      } else {
        throw new Error(response.message || "Failed to update BOM")
      }
    } catch (error: any) {
      console.error("Failed to update BOM:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/manufacturing/boms")
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

  if (!bom) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">BOM not found</h1>
          <p className="text-muted-foreground mt-2">The BOM you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Bill of Materials</h1>
            <p className="text-muted-foreground">Update BOM information and material requirements</p>
          </div>
        </div>

        <BOMForm
          initialData={bom}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Updating..." : "Update BOM"}
        />
      </div>
    </DashboardLayout>
  )
}
