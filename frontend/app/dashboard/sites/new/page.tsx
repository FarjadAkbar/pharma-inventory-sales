"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SiteForm } from "@/components/sites/site-form"

export default function NewSitePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard/sites")
  }

  const handleCancel = () => {
    router.push("/dashboard/sites")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Site</h1>
          <p className="text-muted-foreground">Create a new site for your organization</p>
        </div>
        
        <SiteForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  )
}
