"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RawMaterialForm } from "@/components/raw-materials/raw-material-form"

export default function NewRawMaterialPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard/raw-materials")
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
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  )
}
