"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QCSampleForm } from "@/components/quality/qc-sample-form"
import { qualityControlApi } from "@/services"
import type { QCSample } from "@/types/quality-control"

export default function NewQCSamplePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await qualityControlApi.createQCSample(data)
      router.push("/dashboard/quality/samples")
    } catch (error: any) {
      console.error("Failed to create QC sample:", error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/samples")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create QC Sample</h1>
            <p className="text-muted-foreground">Request a new quality control sample from goods receipt</p>
          </div>
        </div>

        <QCSampleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Sample"
        />
      </div>
    </DashboardLayout>
  )
}

