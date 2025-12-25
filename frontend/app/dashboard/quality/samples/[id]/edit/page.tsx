"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormSelect, FormActions, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import { qualityControlApi } from "@/services"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { QCSample } from "@/types/quality-control"

export default function EditQCSamplePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [sample, setSample] = useState<QCSample | null>(null)

  const initialFormData = {
    status: "",
    priority: "",
    assignedTo: "",
    remarks: "",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    status: {
      required: true,
      message: "Please select a status"
    }
  })

  useEffect(() => {
    if (params.id) {
      fetchQCSample(params.id as string)
    }
  }, [params.id])

  const fetchQCSample = async (id: string) => {
    try {
      setLoading(true)
      const response = await qualityControlApi.getQCSample(id)
      setSample(response)
      formState.updateField('status', response.status || "")
      formState.updateField('priority', response.priority || "")
      formState.updateField('assignedTo', response.assignedTo || "")
      formState.updateField('remarks', response.remarks || "")
    } catch (error) {
      console.error("Failed to fetch QC sample:", error)
      router.push("/dashboard/quality/samples")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    formState.setLoading(true)
    formState.clearErrors()

    try {
      const errors = validation.validateForm(formState.data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      await qualityControlApi.updateQCSample(params.id as string, {
        status: formState.data.status,
        priority: formState.data.priority || undefined,
        assignedTo: formState.data.assignedTo || undefined,
        remarks: formState.data.remarks || undefined,
      })

      router.push("/dashboard/quality/samples")
    } catch (error: any) {
      formState.setError(error.message || "Failed to update QC sample")
    } finally {
      formState.setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/samples")
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

  if (!sample) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">QC Sample not found</h1>
          <p className="text-muted-foreground mt-2">The QC sample you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/quality/samples">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit QC Sample</h1>
              <p className="text-muted-foreground">Update QC sample status and details</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>QC Sample Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sample Number</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{sample.sampleNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material</label>
                <p className="text-lg">{sample.materialName} ({sample.materialCode})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                <p className="text-lg">{sample.batchNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="text-lg">{sample.quantity} {sample.unit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update QC Sample</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              onSubmit={handleSubmit}
              loading={formState.isLoading}
              error={formState.error}
              success={formState.success}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <FormSelect
                  name="status"
                  label="Status *"
                  value={formState.data.status}
                  onChange={(value) => formState.updateField('status', value)}
                  error={formState.errors.status}
                  required
                  options={[
                    { value: "Pending", label: "Pending" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Completed", label: "Completed" },
                    { value: "Failed", label: "Failed" },
                  ]}
                  placeholder="Select status"
                />

                <FormSelect
                  name="priority"
                  label="Priority"
                  value={formState.data.priority}
                  onChange={(value) => formState.updateField('priority', value)}
                  options={[
                    { value: "Low", label: "Low" },
                    { value: "Normal", label: "Normal" },
                    { value: "High", label: "High" },
                    { value: "Urgent", label: "Urgent" },
                  ]}
                  placeholder="Select priority"
                />

                <div className="md:col-span-2">
                  <FormTextarea
                    name="remarks"
                    label="Remarks"
                    value={formState.data.remarks}
                    onChange={(e) => formState.updateField('remarks', e.target.value)}
                    placeholder="Additional notes or comments"
                    rows={3}
                  />
                </div>
              </div>

              <FormActions
                loading={formState.isLoading}
                submitLabel="Update Sample"
                onCancel={handleCancel}
              />
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

