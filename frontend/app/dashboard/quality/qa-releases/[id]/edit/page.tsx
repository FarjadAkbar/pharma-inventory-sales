"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import { qualityAssuranceApi } from "@/services"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { QARelease } from "@/types/quality-assurance"

export default function EditQAReleasePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [release, setRelease] = useState<QARelease | null>(null)

  const initialFormData = {
    remarks: "",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({})

  useEffect(() => {
    if (params.id) {
      fetchQARelease(params.id as string)
    }
  }, [params.id])

  const fetchQARelease = async (id: string) => {
    try {
      setLoading(true)
      const response = await qualityAssuranceApi.getQARelease(id)
      setRelease(response)
      formState.updateField('remarks', response.remarks || "")
    } catch (error) {
      console.error("Failed to fetch QA release:", error)
      router.push("/dashboard/quality/qa-releases")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    formState.setLoading(true)
    formState.clearErrors()

    try {
      await qualityAssuranceApi.updateQARelease(params.id as string, {
        remarks: formState.data.remarks || undefined,
      })

      router.push("/dashboard/quality/qa-releases")
    } catch (error: any) {
      formState.setError(error.message || "Failed to update QA release")
    } finally {
      formState.setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/qa-releases")
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

  if (!release) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">QA Release not found</h1>
          <p className="text-muted-foreground mt-2">The QA release you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/quality/qa-releases">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit QA Release</h1>
              <p className="text-muted-foreground">Update QA release remarks</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>QA Release Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Release Number</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{release.releaseNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material</label>
                <p className="text-lg">{release.materialName} ({release.materialCode})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                <p className="text-lg">{release.batchNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="text-lg">{release.quantity} {release.unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-lg">{release.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Decision</label>
                <p className="text-lg">{release.decision || "Pending"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              onSubmit={handleSubmit}
              loading={formState.isLoading}
              error={formState.error || undefined}
              success={formState.success || undefined}
            >
              <FormTextarea
                name="remarks"
                label="Remarks"
                value={formState.data.remarks}
                onChange={(e) => formState.updateField('remarks', e.target.value)}
                placeholder="Additional notes or comments"
                rows={4}
              />

              <FormActions
                loading={formState.isLoading}
                submitLabel="Update Release"
                onCancel={handleCancel}
              />
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

