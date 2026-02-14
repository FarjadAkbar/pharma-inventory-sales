"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormInput, FormSelect, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import type { QARelease } from "@/types/quality-assurance"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, FileCheck, Beaker } from "lucide-react"
import { qualityControlApi } from "@/services"
import { qualityAssuranceApi } from "@/services"
import type { QCSample } from "@/types/quality-control"

interface QAReleaseFormProps {
  initialData?: Partial<QARelease>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function QAReleaseForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: QAReleaseFormProps) {
  const [qcSamples, setQCSamples] = useState<QCSample[]>([])
  const [selectedSample, setSelectedSample] = useState<QCSample | null>(null)
  const [qcResults, setQcResults] = useState<any[]>([])
  const [selectedResultIds, setSelectedResultIds] = useState<number[]>([])

  const initialFormData = {
    sampleId: initialData?.entityId || "",
    goodsReceiptItemId: (initialData as any)?.goodsReceiptItemId || "",
    materialId: initialData?.materialId || "",
    materialName: initialData?.materialName || "",
    materialCode: initialData?.materialCode || "",
    batchNumber: initialData?.batchNumber || "",
    quantity: initialData?.quantity?.toString() || "",
    unit: initialData?.unit || "",
    remarks: initialData?.remarks || "",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    sampleId: {
      required: true,
      message: "Please select a QC sample"
    }
  })

  useEffect(() => {
    fetchQCSamples()
  }, [])

  useEffect(() => {
    if (initialData?.entityId) {
      fetchQCSample(initialData.entityId)
    }
  }, [initialData?.entityId])

  const fetchQCSamples = async () => {
    try {
      // Fetch samples that are submitted to QA or QC Complete
      const samples = await qualityControlApi.getQCSamples({ 
        status: "Submitted to QA",
        limit: 100 
      })
      const allSamples = Array.isArray(samples) ? samples : []
      // Also get QC Complete samples
      const completeSamples = await qualityControlApi.getQCSamples({ 
        status: "QC Complete",
        limit: 100 
      })
      const complete = Array.isArray(completeSamples) ? completeSamples : []
      // Combine and remove duplicates
      const combined = [...allSamples, ...complete]
      const unique = combined.filter((sample, index, self) => 
        index === self.findIndex(s => s.id === sample.id)
      )
      setQCSamples(unique)
    } catch (error) {
      console.error("Failed to fetch QC samples:", error)
    }
  }

  const fetchQCSample = async (id: string) => {
    try {
      const sample = await qualityControlApi.getQCSample(id)
      setSelectedSample(sample)
      handleSampleSelect(sample)
    } catch (error) {
      console.error("Failed to fetch QC sample:", error)
    }
  }

  const handleSampleSelect = async (sample: QCSample) => {
    setSelectedSample(sample)
    formState.updateField('sampleId', sample.id)
    formState.updateField('materialId', sample.materialId)
    formState.updateField('materialName', sample.materialName)
    formState.updateField('materialCode', sample.materialCode)
    formState.updateField('batchNumber', sample.batchNumber)
    formState.updateField('quantity', sample.quantity.toString())
    formState.updateField('unit', sample.unit)
    formState.updateField('goodsReceiptItemId', (sample as any).goodsReceiptItemId || "")

    // Fetch QC Results for this sample
    try {
      const results = await qualityControlApi.getQCResults({ sampleId: parseInt(sample.id) })
      const submittedResults = Array.isArray(results) 
        ? results.filter((r: any) => r.submittedToQA)
        : []
      setQcResults(submittedResults)
      // Auto-select all submitted results
      setSelectedResultIds(submittedResults.map((r: any) => parseInt(r.id)))
    } catch (error) {
      console.error("Failed to fetch QC results:", error)
      setQcResults([])
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

      if (!selectedSample) {
        formState.setError("Please select a QC sample")
        return
      }

      if (selectedResultIds.length === 0) {
        formState.setError("Please select at least one QC result")
        return
      }

      const releaseData = {
        sampleId: parseInt(selectedSample.id),
        goodsReceiptItemId: parseInt(formState.data.goodsReceiptItemId),
        materialId: parseInt(formState.data.materialId),
        materialName: formState.data.materialName,
        materialCode: formState.data.materialCode,
        batchNumber: formState.data.batchNumber,
        quantity: parseFloat(formState.data.quantity),
        unit: formState.data.unit,
        qcResultIds: selectedResultIds,
        submittedBy: 1, // Mock user ID - should come from auth context
      }

      await onSubmit(releaseData)
      formState.setSuccess("QA release created successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to create QA release")
    } finally {
      formState.setLoading(false)
    }
  }

  const toggleResult = (resultId: number) => {
    setSelectedResultIds(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select QC Sample</CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            onSubmit={handleSubmit}
            loading={formState.isLoading}
            error={formState.error || undefined}
            success={formState.success || undefined}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <FormSelect
                name="sampleId"
                label="QC Sample *"
                value={selectedSample?.sampleCode || ""}
                onChange={(value) => {
                  const sample = qcSamples.find(s => s.sampleCode === value)
                  if (sample) {
                    handleSampleSelect(sample)
                  }
                }}
                error={formState.errors.sampleId}
                required
                options={qcSamples.map(sample => ({
                  value: sample.sampleCode,
                  label: `${sample.sampleCode} - ${sample.materialName} (${sample.status})`
                }))}
                placeholder="Select QC sample"
              />
            </div>
          </Form>
        </CardContent>
      </Card>

      {selectedSample && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sample Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Material Name</label>
                  <p className="text-lg font-semibold">{selectedSample.materialName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Material Code</label>
                  <p className="text-lg font-semibold">{selectedSample.materialCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                  <p className="text-lg">{selectedSample.batchNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                  <p className="text-lg">{selectedSample.quantity} {selectedSample.unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-lg">{selectedSample.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select QC Results *</CardTitle>
            </CardHeader>
            <CardContent>
              {qcResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No QC results submitted to QA for this sample.</p>
                  <p className="text-sm mt-2">Please submit QC results to QA first.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {qcResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => toggleResult(parseInt(result.id))}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                        selectedResultIds.includes(parseInt(result.id))
                          ? "border-primary bg-primary/5"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {result.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{result.testName || result.test?.name || "Unknown Test"}</div>
                          <div className="text-sm text-muted-foreground">
                            Result: {result.resultValue} {result.unit} | 
                            {result.passed ? (
                              <span className="text-green-600 ml-1">Passed</span>
                            ) : (
                              <span className="text-red-600 ml-1">Failed</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedResultIds.includes(parseInt(result.id)) && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormTextarea
                name="remarks"
                label="Remarks"
                value={formState.data.remarks}
                onChange={(e) => formState.updateField('remarks', e.target.value)}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={formState.isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={formState.isLoading || !selectedSample || selectedResultIds.length === 0}
        >
          {formState.isLoading ? "Creating..." : submitLabel}
        </Button>
      </div>
    </div>
  )
}

