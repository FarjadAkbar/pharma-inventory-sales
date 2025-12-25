"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QCTestForm } from "@/components/quality/qc-test-form"
import { qualityControlApi } from "@/services"
import type { QCTest } from "@/types/quality-control"

export default function NewQCTestPage() {
  const router = useRouter()

  const handleSubmit = async (data: QCTest) => {
    try {
      await qualityControlApi.createQCTest(data)
      router.push("/dashboard/quality/qc-tests")
    } catch (error: any) {
      console.error("Failed to create QC test:", error)
      throw error
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
            <h1 className="text-3xl font-bold tracking-tight">Create QC Test Method</h1>
            <p className="text-muted-foreground">Add a new quality control test method and specifications</p>
          </div>
        </div>

        <QCTestForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Test Method"
        />
      </div>
    </DashboardLayout>
  )
}

