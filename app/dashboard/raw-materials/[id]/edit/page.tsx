"use client"

import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RawMaterialForm } from "@/components/raw-materials/raw-material-form"

export default function EditRawMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const rawMaterialId = params.id ? parseInt(params.id as string) : undefined

  const handleSuccess = () => {
    router.push("/dashboard/raw-materials")
  }

  const handleCancel = () => {
    router.push("/dashboard/raw-materials")
  }

  if (!rawMaterialId) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Invalid Raw Material ID</h1>
          <p className="text-muted-foreground mt-2">The raw material ID is invalid.</p>
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
          rawMaterialId={rawMaterialId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  )
}
