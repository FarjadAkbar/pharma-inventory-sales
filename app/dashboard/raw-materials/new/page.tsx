"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RawMaterialForm } from "@/components/pharma/raw-material-form"
import { apiService } from "@/services/api.service"
import type { RawMaterial } from "@/types/pharma"

export default function NewRawMaterialPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: RawMaterial) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.createRawMaterial(data)
      if (response.success) {
        router.push("/dashboard/raw-materials")
      } else {
        throw new Error(response.message || "Failed to create raw material")
      }
    } catch (error: any) {
      console.error("Failed to create raw material:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/raw-materials")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Raw Material</h1>
            <p className="text-muted-foreground">Create a new raw material entry</p>
          </div>
        </div>

        <RawMaterialForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Creating..." : "Create Raw Material"}
        />
      </div>
    </DashboardLayout>
  )
}
