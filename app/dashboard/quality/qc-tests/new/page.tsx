"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QCTestForm } from "@/components/quality/qc-test-form"
import { apiService } from "@/services/api.service"
import type { QCTest } from "@/types/quality-control"

export default function NewQCTestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: QCTest) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.createQCTest(data)
      if (response.success) {
        router.push("/dashboard/quality/qc-tests")
      } else {
        throw new Error(response.message || "Failed to create QC test")
      }
    } catch (error: any) {
      console.error("Failed to create QC test:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/qc-tests")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add QC Test Method</h1>
            <p className="text-muted-foreground">Create a new quality control test method</p>
          </div>
        </div>

        <QCTestForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Creating..." : "Create Test Method"}
        />
      </div>
    </DashboardLayout>
  )
}
