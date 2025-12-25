"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import { qualityControlApi } from "@/services"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function EditQCResultPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [samples, setSamples] = useState<Array<{ value: string; label: string }>>([])
  const [tests, setTests] = useState<Array<{ value: string; label: string }>>([])
  const [showDeviationDialog, setShowDeviationDialog] = useState(false)
  const [qcResultData, setQcResultData] = useState<any>(null)

  const initialFormData = {
    sampleId: "",
    testId: "",
    resultValue: "",
    unit: "",
    passed: false,
    remarks: "",
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
    if (params.id) {
      fetchQCResult(params.id as string)
      fetchSamples()
      fetchTests()
    }
  }, [params.id])

  const fetchQCResult = async (id: string) => {
    try {
      setLoading(true)
      const result = await qualityControlApi.getQCResult(id)
      formState.updateField('sampleId', result.sampleId?.toString() || "")
      formState.updateField('testId', result.testId?.toString() || "")
      formState.updateField('resultValue', result.resultValue || "")
      formState.updateField('unit', result.unit || "")
      formState.updateField('passed', result.passed || false)
      formState.updateField('remarks', result.remarks || "")
      
      // Store result data for deviation creation
      setQcResultData({
        resultId: id,
        testName: result.test?.name || result.testName || "Unknown Test",
        testCode: result.test?.code || result.testCode || "",
        resultValue: result.resultValue || "",
        unit: result.unit || "",
        sampleId: result.sampleId?.toString() || "",
        materialId: result.sample?.materialId?.toString() || result.materialId?.toString(),
        materialName: result.sample?.materialName || result.materialName,
        batchNumber: result.sample?.batchNumber || result.batchNumber,
      })
    } catch (error) {
      console.error("Failed to fetch QC result:", error)
      router.push("/dashboard/quality/qc-results")
    } finally {
      setLoading(false)
    }
  }

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

      await qualityControlApi.updateQCResult(params.id as string, {
        resultValue: formState.data.resultValue,
        unit: formState.data.unit,
        passed: formState.data.passed,
        remarks: formState.data.remarks || undefined,
      })

      // If result failed, prompt to create deviation
      if (!formState.data.passed && qcResultData) {
        setShowDeviationDialog(true)
      } else {
        router.push("/dashboard/quality/qc-results")
      }
    } catch (error: any) {
      formState.setError(error.message || "Failed to update QC result")
    } finally {
      formState.setLoading(false)
    }
  }

  const handleCreateDeviation = () => {
    if (!qcResultData) return
    
    const params = new URLSearchParams({
      qcResultId: qcResultData.resultId,
      testName: qcResultData.testName,
      testCode: qcResultData.testCode,
      resultValue: qcResultData.resultValue,
      unit: qcResultData.unit,
      sampleId: qcResultData.sampleId,
    })
    
    if (qcResultData.materialId) params.set('materialId', qcResultData.materialId)
    if (qcResultData.materialName) params.set('materialName', qcResultData.materialName)
    if (qcResultData.batchNumber) params.set('batchNumber', qcResultData.batchNumber)
    
    router.push(`/dashboard/quality/deviations/new?${params.toString()}`)
  }

  const handleSkipDeviation = () => {
    setShowDeviationDialog(false)
    router.push("/dashboard/quality/qc-results")
  }

  const handleCancel = () => {
    router.push("/dashboard/quality/qc-results")
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
              <h1 className="text-3xl font-bold tracking-tight">Edit QC Result</h1>
              <p className="text-muted-foreground">Update quality control test result</p>
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
                  label="QC Sample"
                  value={formState.data.sampleId}
                  onChange={(value) => formState.updateField('sampleId', value)}
                  options={samples}
                  placeholder="Select a QC sample"
                  disabled
                />

                <FormSelect
                  name="testId"
                  label="Test"
                  value={formState.data.testId}
                  onChange={(value) => formState.updateField('testId', value)}
                  options={tests}
                  placeholder="Select a test"
                  disabled
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
                submitLabel="Update Result"
                onCancel={handleCancel}
              />
            </Form>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={showDeviationDialog}
          onOpenChange={setShowDeviationDialog}
          title="QC Test Failed - Create Deviation?"
          description={
            <div className="space-y-2">
              <p>
                The QC test "{qcResultData?.testName}" has failed with result: {qcResultData?.resultValue} {qcResultData?.unit}
              </p>
              <p className="text-sm text-muted-foreground">
                Would you like to create a deviation to track this failure and initiate an investigation?
              </p>
            </div>
          }
          confirmText="Create Deviation"
          cancelText="Skip"
          onConfirm={handleCreateDeviation}
          onCancel={handleSkipDeviation}
          variant="default"
        />
      </div>
    </DashboardLayout>
  )
}

