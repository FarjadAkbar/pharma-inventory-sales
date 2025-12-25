"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QAReleaseForm } from "@/components/quality/qa-release-form"
import { qualityAssuranceApi } from "@/services"

export default function NewQAReleasePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await qualityAssuranceApi.createQARelease(data)
      router.push("/dashboard/quality/qa-releases")
    } catch (error: any) {
      console.error("Failed to create QA release:", error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/qa-releases")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create QA Release</h1>
            <p className="text-muted-foreground">Create a new quality assurance release from QC sample</p>
          </div>
        </div>

        <QAReleaseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Release"
        />
      </div>
    </DashboardLayout>
  )
}

