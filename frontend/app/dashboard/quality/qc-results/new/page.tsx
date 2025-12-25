"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import { qualityControlApi } from "@/services"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewQCResultPage() {
  const router = useRouter()
  const [samples, setSamples] = useState<Array<{ value: string; label: string }>>([])
  const [tests, setTests] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(true)

  const initialFormData = {
    sampleId: "",
    testId: "",
    resultValue: "",
    unit: "",
    passed: false,
    remarks: "",
    performedBy: "1", // TODO: Get from authenticated user context
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    sampleId: {
      required: true,
      message: "Please select a QC sample"
    },
    testId: {
      required: true,
      message: "Please select a test"
    },
    resultValue: {
      required: true,
      message: "Please enter a result value"
    },
    unit: {
      required: true,
      message: "Please enter a unit"
    }
  })

  useEffect(() => {
    fetchSamples()
    fetchTests()
  }, [])

  const fetchSamples = async () => {
    try {
      const response = await qualityControlApi.getQCSamples({ limit: 100 })
      const samplesList = Array.isArray(response) ? response : []
      setSamples(samplesList.map((s: any) => ({
        value: s.id.toString(),
        label: `${s.sampleNumber} - ${s.materialName} (${s.batchNumber})`
      })))
    } catch (error) {
      console.error("Failed to fetch QC samples:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTests = async () => {
    try {
      const response = await qualityControlApi.getQCTests({ limit: 100 })
      const testsList = Array.isArray(response) ? response : []
      setTests(testsList.map((t: any) => ({
        value: t.id.toString(),
        label: `${t.code} - ${t.name}`
      })))
    } catch (error) {
      console.error("Failed to fetch QC tests:", error)
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

      await qualityControlApi.createQCResult({
        sampleId: parseInt(formState.data.sampleId),
        testId: parseInt(formState.data.testId),
        resultValue: formState.data.resultValue,
        unit: formState.data.unit,
        passed: formState.data.passed,
        remarks: formState.data.remarks || undefined,
        performedBy: parseInt(formState.data.performedBy),
        performedAt: new Date().toISOString(),
      })

      router.push("/dashboard/quality/qc-results")
    } catch (error: any) {
      formState.setError(error.message || "Failed to create QC result")
    } finally {
      formState.setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/qc-results")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/quality/qc-results">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create QC Result</h1>
              <p className="text-muted-foreground">Record a new quality control test result</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>QC Result Details</CardTitle>
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
                  name="sampleId"
                  label="QC Sample *"
                  value={formState.data.sampleId}
                  onChange={(value) => formState.updateField('sampleId', value)}
                  error={formState.errors.sampleId}
                  required
                  options={samples}
                  placeholder={loading ? "Loading samples..." : "Select a QC sample"}
                  disabled={loading}
                />

                <FormSelect
                  name="testId"
                  label="Test *"
                  value={formState.data.testId}
                  onChange={(value) => formState.updateField('testId', value)}
                  error={formState.errors.testId}
                  required
                  options={tests}
                  placeholder="Select a test"
                />

                <FormInput
                  name="resultValue"
                  label="Result Value *"
                  value={formState.data.resultValue}
                  onChange={(e) => formState.updateField('resultValue', e.target.value)}
                  error={formState.errors.resultValue}
                  required
                  placeholder="e.g., 98.5"
                />

                <FormInput
                  name="unit"
                  label="Unit *"
                  value={formState.data.unit}
                  onChange={(e) => formState.updateField('unit', e.target.value)}
                  error={formState.errors.unit}
                  required
                  placeholder="e.g., %"
                />

                <div className="md:col-span-2">
                  <FormCheckbox
                    name="passed"
                    label="Test Passed"
                    checked={formState.data.passed}
                    onChange={(e) => formState.updateField('passed', e.target.checked)}
                  />
                </div>

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
                submitLabel="Create Result"
                onCancel={handleCancel}
              />
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

