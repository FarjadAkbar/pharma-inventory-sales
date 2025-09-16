"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DrugForm } from "@/components/pharma/drug-form"
import { apiService } from "@/services/api.service"
import type { Drug } from "@/types/pharma"

export default function NewDrugPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Drug) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.createDrug(data)
      if (response.success) {
        router.push("/dashboard/drugs")
      } else {
        throw new Error(response.message || "Failed to create drug")
      }
    } catch (error: any) {
      console.error("Failed to create drug:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/drugs")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Drug</h1>
            <p className="text-muted-foreground">Create a new pharmaceutical drug entry</p>
          </div>
        </div>

        <DrugForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Creating..." : "Create Drug"}
        />
      </div>
    </DashboardLayout>
  )
}