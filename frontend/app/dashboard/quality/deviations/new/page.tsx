"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QADeviationForm } from "@/components/quality/qa-deviation-form"
import { qualityAssuranceApi } from "@/services"

export default function NewQADeviationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get QC Result data from query params if coming from QC Results page
  const qcResultData = searchParams.get('qcResultId') ? {
    resultId: searchParams.get('qcResultId') || "",
    testName: searchParams.get('testName') || "",
    testCode: searchParams.get('testCode') || "",
    resultValue: searchParams.get('resultValue') || "",
    unit: searchParams.get('unit') || "",
    sampleId: searchParams.get('sampleId') || "",
    materialId: searchParams.get('materialId') || undefined,
    materialName: searchParams.get('materialName') || undefined,
    batchNumber: searchParams.get('batchNumber') || undefined,
  } : undefined

  const handleSubmit = async (data: any) => {
    try {
      await qualityAssuranceApi.createQADeviation(data)
      router.push("/dashboard/quality/deviations")
    } catch (error: any) {
      console.error("Failed to create deviation:", error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/deviations")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Deviation</h1>
            <p className="text-muted-foreground">
              {qcResultData 
                ? "Create a deviation from QC test failure"
                : "Create a new quality deviation"}
            </p>
          </div>
        </div>

        <QADeviationForm
          qcResultData={qcResultData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Deviation"
        />
      </div>
    </DashboardLayout>
  )
}

