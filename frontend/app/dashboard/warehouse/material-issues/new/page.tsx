"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MaterialIssueForm } from "@/components/warehouse/material-issue-form"
import { warehouseApi } from "@/services"
import { toast } from "sonner"

export default function NewMaterialIssuePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await warehouseApi.createMaterialIssue(data)
      toast.success("Material issue request created successfully")
      router.push("/dashboard/warehouse/material-issues")
    } catch (error: any) {
      toast.error(error.message || "Failed to create material issue")
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/warehouse/material-issues")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Material Issue Request</h1>
          <p className="text-muted-foreground">Request materials for production or manufacturing</p>
        </div>

        <MaterialIssueForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Request"
        />
      </div>
    </DashboardLayout>
  )
}

