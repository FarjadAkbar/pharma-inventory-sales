"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QCTestForm } from "@/components/quality/qc-test-form"
import { apiService } from "@/services/api.service"
import type { QCTest } from "@/types/quality-control"

export default function EditQCTestPage() {
  const router = useRouter()
  const params = useParams()
  const [qcTest, setQCTest] = useState<QCTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchQCTest(params.id as string)
    }
  }, [params.id])

  const fetchQCTest = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getQCTests({ search: id, limit: 1 })
      if (response.success && response.data?.qcTests?.length > 0) {
        setQCTest(response.data.qcTests[0])
      } else {
        throw new Error("QC test not found")
      }
    } catch (error) {
      console.error("Failed to fetch QC test:", error)
      router.push("/dashboard/quality/qc-tests")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: QCTest) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.updateQCTest({ ...data, id: params.id })
      if (response.success) {
        router.push("/dashboard/quality/qc-tests")
      } else {
        throw new Error(response.message || "Failed to update QC test")
      }
    } catch (error: any) {
      console.error("Failed to update QC test:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/qc-tests")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!qcTest) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">QC test not found</h1>
          <p className="text-muted-foreground mt-2">The QC test you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit QC Test Method</h1>
            <p className="text-muted-foreground">Update QC test method and specifications</p>
          </div>
        </div>

        <QCTestForm
          initialData={qcTest}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Updating..." : "Update Test Method"}
        />
      </div>
    </DashboardLayout>
  )
}
