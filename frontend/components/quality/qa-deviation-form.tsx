"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormInput, FormSelect, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import type { QADeviation } from "@/types/quality-assurance"
import { Button } from "@/components/ui/button"
import { AlertTriangle, FileText, Beaker, Package, Activity, User } from "lucide-react"
import type { QCTestResult } from "@/types/quality-control"

interface QADeviationFormProps {
  initialData?: Partial<QADeviation>
  qcResultData?: {
    resultId: string
    testName: string
    testCode: string
    resultValue: string
    unit: string
    sampleId: string
    materialId?: string
    materialName?: string
    batchNumber?: string
  }
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function QADeviationForm({ 
  initialData,
  qcResultData,
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: QADeviationFormProps) {
  const initialFormData = {
    title: initialData?.title || qcResultData ? `QC Test Failure: ${qcResultData.testName}` : "",
    description: initialData?.description || qcResultData 
      ? `QC test "${qcResultData.testName}" (${qcResultData.testCode}) failed with result: ${qcResultData.resultValue} ${qcResultData.unit}`
      : "",
    severity: initialData?.severity || "Major",
    category: initialData?.category || "Quality",
    sourceType: initialData?.sourceType || (qcResultData ? "QC" : "QC"),
    sourceId: initialData?.sourceId || qcResultData?.resultId || "",
    sourceReference: initialData?.sourceReference || qcResultData 
      ? `QC Result: ${qcResultData.testCode}`
      : "",
    materialId: initialData?.materialId || qcResultData?.materialId || "",
    materialName: initialData?.materialName || qcResultData?.materialName || "",
    batchNumber: initialData?.batchNumber || qcResultData?.batchNumber || "",
    assignedTo: initialData?.assignedTo || "",
    dueDate: initialData?.dueDate || "",
    rootCause: initialData?.rootCause || "",
    immediateAction: initialData?.immediateAction || "",
    correctiveAction: initialData?.correctiveAction || "",
    preventiveAction: initialData?.preventiveAction || "",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    title: {
      required: true,
      message: "Please enter a title"
    },
    description: {
      required: true,
      message: "Please enter a description"
    },
    severity: {
      required: true,
      message: "Please select a severity"
    },
    category: {
      required: true,
      message: "Please select a category"
    },
    sourceType: {
      required: true,
      message: "Please select a source type"
    }
  })

  const handleSubmit = async () => {
    formState.setLoading(true)
    formState.clearErrors()

    try {
      const errors = validation.validateForm(formState.data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      const deviationData = {
        title: formState.data.title,
        description: formState.data.description,
        severity: formState.data.severity,
        category: formState.data.category,
        sourceType: formState.data.sourceType,
        sourceId: parseInt(formState.data.sourceId),
        sourceReference: formState.data.sourceReference,
        materialId: formState.data.materialId ? parseInt(formState.data.materialId) : undefined,
        materialName: formState.data.materialName || undefined,
        batchNumber: formState.data.batchNumber || undefined,
        assignedTo: formState.data.assignedTo ? parseInt(formState.data.assignedTo) : undefined,
        dueDate: formState.data.dueDate || undefined,
        rootCause: formState.data.rootCause || undefined,
        immediateAction: formState.data.immediateAction || undefined,
        correctiveAction: formState.data.correctiveAction || undefined,
        preventiveAction: formState.data.preventiveAction || undefined,
        discoveredBy: 1, // Mock user ID - should come from auth context
      }

      await onSubmit(deviationData)
      formState.setSuccess("Deviation created successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to create deviation")
    } finally {
      formState.setLoading(false)
    }
  }

  const severities = [
    { value: "Minor", label: "Minor" },
    { value: "Major", label: "Major" },
    { value: "Critical", label: "Critical" },
  ]

  const categories = [
    { value: "Quality", label: "Quality" },
    { value: "Safety", label: "Safety" },
    { value: "Compliance", label: "Compliance" },
    { value: "Process", label: "Process" },
    { value: "Documentation", label: "Documentation" },
    { value: "Equipment", label: "Equipment" },
  ]

  const sourceTypes = [
    { value: "QC", label: "Quality Control" },
    { value: "Production", label: "Production" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Distribution", label: "Distribution" },
    { value: "Customer", label: "Customer" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deviation Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            onSubmit={handleSubmit}
            loading={formState.isLoading}
            error={formState.error || undefined}
            success={formState.success || undefined}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                name="title"
                label="Title *"
                value={formState.data.title}
                onChange={(e) => formState.updateField('title', e.target.value)}
                error={formState.errors.title}
                required
                placeholder="Enter deviation title"
              />

              <FormSelect
                name="severity"
                label="Severity *"
                value={formState.data.severity}
                onChange={(value) => formState.updateField('severity', value)}
                error={formState.errors.severity}
                required
                options={severities}
                placeholder="Select severity"
              />

              <FormSelect
                name="category"
                label="Category *"
                value={formState.data.category}
                onChange={(value) => formState.updateField('category', value)}
                error={formState.errors.category}
                required
                options={categories}
                placeholder="Select category"
              />

              <FormSelect
                name="sourceType"
                label="Source Type *"
                value={formState.data.sourceType}
                onChange={(value) => formState.updateField('sourceType', value)}
                error={formState.errors.sourceType}
                required
                options={sourceTypes}
                placeholder="Select source type"
              />

              <FormInput
                name="sourceId"
                label="Source ID *"
                value={formState.data.sourceId}
                onChange={(e) => formState.updateField('sourceId', e.target.value)}
                error={formState.errors.sourceId}
                required
                placeholder="Source reference ID"
                disabled={!!qcResultData}
              />

              <FormInput
                name="sourceReference"
                label="Source Reference *"
                value={formState.data.sourceReference}
                onChange={(e) => formState.updateField('sourceReference', e.target.value)}
                error={formState.errors.sourceReference}
                required
                placeholder="Source reference"
                disabled={!!qcResultData}
              />

              {qcResultData && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Material</label>
                    <p className="text-lg">{formState.data.materialName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                    <p className="text-lg">{formState.data.batchNumber || "N/A"}</p>
                  </div>
                </>
              )}

              {!qcResultData && (
                <>
                  <FormInput
                    name="materialName"
                    label="Material Name"
                    value={formState.data.materialName}
                    onChange={(e) => formState.updateField('materialName', e.target.value)}
                    placeholder="Enter material name (if applicable)"
                  />

                  <FormInput
                    name="batchNumber"
                    label="Batch Number"
                    value={formState.data.batchNumber}
                    onChange={(e) => formState.updateField('batchNumber', e.target.value)}
                    placeholder="Enter batch number (if applicable)"
                  />
                </>
              )}

              <FormInput
                name="assignedTo"
                label="Assign To"
                value={formState.data.assignedTo}
                onChange={(e) => formState.updateField('assignedTo', e.target.value)}
                placeholder="User ID (optional)"
              />

              <FormInput
                name="dueDate"
                label="Due Date"
                value={formState.data.dueDate}
                onChange={(e) => formState.updateField('dueDate', e.target.value)}
                type="date"
                placeholder="Select due date"
              />
            </div>

            <FormTextarea
              name="description"
              label="Description *"
              value={formState.data.description}
              onChange={(e) => formState.updateField('description', e.target.value)}
              error={formState.errors.description}
              required
              placeholder="Describe the deviation in detail"
              rows={4}
            />
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investigation & CAPA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FormTextarea
              name="rootCause"
              label="Root Cause"
              value={formState.data.rootCause}
              onChange={(e) => formState.updateField('rootCause', e.target.value)}
              placeholder="Root cause analysis (can be filled later)"
              rows={3}
            />

            <FormTextarea
              name="immediateAction"
              label="Immediate Action"
              value={formState.data.immediateAction}
              onChange={(e) => formState.updateField('immediateAction', e.target.value)}
              placeholder="Immediate actions taken (can be filled later)"
              rows={3}
            />

            <FormTextarea
              name="correctiveAction"
              label="Corrective Action"
              value={formState.data.correctiveAction}
              onChange={(e) => formState.updateField('correctiveAction', e.target.value)}
              placeholder="Corrective actions (can be filled later)"
              rows={3}
            />

            <FormTextarea
              name="preventiveAction"
              label="Preventive Action"
              value={formState.data.preventiveAction}
              onChange={(e) => formState.updateField('preventiveAction', e.target.value)}
              placeholder="Preventive actions (can be filled later)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

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
          disabled={formState.isLoading}
        >
          {formState.isLoading ? "Creating..." : submitLabel}
        </Button>
      </div>
    </div>
  )
}

