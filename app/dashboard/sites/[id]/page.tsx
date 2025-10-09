"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SiteForm } from "@/components/sites/site-form"

interface EditSitePageProps {
  params: Promise<{ id: string }>
}

export default function EditSitePage({ params }: EditSitePageProps) {
  const { id } = React.use(params)
  const router = useRouter()
  const siteId = parseInt(id)

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Site</h1>
          <p className="text-muted-foreground">Update site information</p>
        </div>
        
        <SiteForm siteId={siteId} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  )
}
