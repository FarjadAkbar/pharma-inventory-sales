"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QADeviationForm } from "@/components/quality/qa-deviation-form"
import { qualityAssuranceApi } from "@/services"
import type { QADeviation } from "@/types/quality-assurance"

export default function EditQADeviationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [deviation, setDeviation] = useState<QADeviation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeviation = async () => {
      try {
        const data = await qualityAssuranceApi.getQADeviation(id)
        setDeviation(data)
      } catch (error) {
        console.error("Failed to fetch deviation:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDeviation()
    }
  }, [id])

  const handleSubmit = async (data: any) => {
    try {
      await qualityAssuranceApi.updateQADeviation(id, data)
      router.push("/dashboard/quality/deviations")
    } catch (error: any) {
      console.error("Failed to update deviation:", error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/deviations")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!deviation) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Deviation not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Deviation</h1>
            <p className="text-muted-foreground">Update deviation information and investigation details</p>
          </div>
        </div>

        <QADeviationForm
          initialData={deviation}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Deviation"
        />
      </div>
    </DashboardLayout>
  )
}

