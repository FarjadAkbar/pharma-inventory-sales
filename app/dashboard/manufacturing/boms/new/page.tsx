"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BOMForm } from "@/components/manufacturing/bom-form"
import { apiService } from "@/services/api.service"
import type { BOM } from "@/types/manufacturing"

export default function NewBOMPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: BOM) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.createBOM(data)
      if (response.success) {
        router.push("/dashboard/manufacturing/boms")
      } else {
        throw new Error(response.message || "Failed to create BOM")
      }
    } catch (error: any) {
      console.error("Failed to create BOM:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/manufacturing/boms")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Bill of Materials</h1>
            <p className="text-muted-foreground">Create a new BOM for manufacturing recipes</p>
          </div>
        </div>

        <BOMForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Creating..." : "Create BOM"}
        />
      </div>
    </DashboardLayout>
  )
}