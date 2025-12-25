"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import type { QCTest } from "@/types/quality-control"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, TestTube } from "lucide-react"
import { MEASUREMENT_UNITS } from "@/lib/constants/units"

interface QCSpecification {
  parameter: string
  minValue?: string
  maxValue?: string
  targetValue?: string
  unit: string
  method?: string
}

interface QCTestFormProps {
  initialData?: Partial<QCTest>
  onSubmit: (data: QCTest) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function QCTestForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: QCTestFormProps) {
  // Map initial specifications to form format
  const mapInitialSpecifications = (specs: any[]): QCSpecification[] => {
    return specs.map(spec => ({
      parameter: spec.parameter || "",
      minValue: spec.minValue?.toString() || "",
      maxValue: spec.maxValue?.toString() || "",
      targetValue: spec.targetValue?.toString() || "",
      unit: spec.unit || "",
      method: spec.method || "",
    }))
  }

  const initialFormData = {
    code: initialData?.code || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    status: (initialData as any)?.status || ((initialData as any)?.isActive ? 'Active' : 'Inactive') || 'Active',
    specifications: initialData?.specifications ? mapInitialSpecifications(initialData.specifications) : []
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    name: {
      required: true,
      message: "Please enter a test name"
    }
  })

  const [specifications, setSpecifications] = useState<QCSpecification[]>(initialFormData.specifications)

  const handleSubmit = async () => {
    formState.setLoading(true)
    formState.clearErrors()

    try {
      const errors = validation.validateForm(formState.data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      if (specifications.length === 0) {
        formState.setError("Please add at least one specification")
        return
      }

      // Map specifications to backend format
      const mappedSpecifications = specifications.map(spec => ({
        parameter: spec.parameter,
        minValue: spec.minValue || undefined,
        maxValue: spec.maxValue || undefined,
        targetValue: spec.targetValue || undefined,
        unit: spec.unit,
        method: spec.method || undefined,
      }))

      const testData: any = {
        name: formState.data.name,
        code: formState.data.code || undefined,
        description: formState.data.description || undefined,
        category: formState.data.category || undefined,
        status: formState.data.status as 'Active' | 'Inactive',
        specifications: mappedSpecifications,
      }

      // Add optional fields if they exist in initialData (for backward compatibility)
      if (initialData?.createdAt) testData.createdAt = initialData.createdAt
      if (initialData?.updatedAt) testData.updatedAt = new Date().toISOString()
      if (initialData?.createdById) testData.createdById = initialData.createdById
      if (initialData?.createdByName) testData.createdByName = initialData.createdByName

      await onSubmit(testData as QCTest)

      formState.setSuccess("QC test saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save QC test")
    } finally {
      formState.setLoading(false)
    }
  }

  const addSpecification = () => {
    const newSpec: QCSpecification = {
      parameter: "",
      minValue: "",
      maxValue: "",
      targetValue: "",
      unit: "",
      method: ""
    }
    setSpecifications([...specifications, newSpec])
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: keyof QCSpecification, value: any) => {
    const updatedSpecs = [...specifications]
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value }
    setSpecifications(updatedSpecs)
  }

  const categories = [
    { value: "Physical", label: "Physical" },
    { value: "Chemical", label: "Chemical" },
    { value: "Microbiological", label: "Microbiological" },
    { value: "Stability", label: "Stability" },
    { value: "Dissolution", label: "Dissolution" },
    { value: "Content Uniformity", label: "Content Uniformity" },
    { value: "Assay", label: "Assay" },
    { value: "Impurities", label: "Impurities" },
    { value: "Identification", label: "Identification" }
  ]



  return (
    <Card>
      <CardHeader>
        <CardTitle>QC Test Method Details</CardTitle>
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
              name="code"
              label="Test Code"
              value={formState.data.code}
              onChange={(e) => formState.updateField('code', e.target.value)}
              error={formState.errors.code}
              required
              placeholder="e.g., QC-001"
            />

            <FormInput
              name="name"
              label="Test Name"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
              placeholder="e.g., Assay Test"
            />

            <FormSelect
              name="category"
              label="Category"
              value={formState.data.category}
              onChange={(value) => formState.updateField('category', value)}
              error={formState.errors.category}
              options={categories}
              placeholder="Select category (optional)"
            />

            <FormSelect
              name="status"
              label="Status"
              value={formState.data.status}
              onChange={(value) => formState.updateField('status', value)}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" }
              ]}
              placeholder="Select status"
            />
          </div>

          <FormTextarea
            name="description"
            label="Description"
            value={formState.data.description}
            onChange={(e) => formState.updateField('description', e.target.value)}
            placeholder="Detailed description of the test method"
            rows={3}
          />


          {/* Specifications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Test Specifications</h3>
              <Button type="button" onClick={addSpecification} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Specification
              </Button>
            </div>

            {specifications.map((spec, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Specification {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput
                    name={`parameter_${index}`}
                    label="Parameter *"
                    value={spec.parameter}
                    onChange={(e) => updateSpecification(index, 'parameter', e.target.value)}
                    placeholder="e.g., Assay"
                    required
                  />

                  <FormSelect
                    name={`unit_${index}`}
                    label="Unit *"
                    value={spec.unit}
                    onChange={(value) => updateSpecification(index, 'unit', value)}
                    options={MEASUREMENT_UNITS}
                    placeholder="Select unit"
                    required
                  />

                  <FormInput
                    name={`minValue_${index}`}
                    label="Min Value"
                    value={spec.minValue || ''}
                    onChange={(e) => updateSpecification(index, 'minValue', e.target.value)}
                    placeholder="e.g., 95.0"
                  />

                  <FormInput
                    name={`maxValue_${index}`}
                    label="Max Value"
                    value={spec.maxValue || ''}
                    onChange={(e) => updateSpecification(index, 'maxValue', e.target.value)}
                    placeholder="e.g., 105.0"
                  />

                  <FormInput
                    name={`targetValue_${index}`}
                    label="Target Value"
                    value={spec.targetValue || ''}
                    onChange={(e) => updateSpecification(index, 'targetValue', e.target.value)}
                    placeholder="e.g., 100.0"
                  />

                  <FormInput
                    name={`method_${index}`}
                    label="Method"
                    value={spec.method || ''}
                    onChange={(e) => updateSpecification(index, 'method', e.target.value)}
                    placeholder="e.g., HPLC"
                  />
                </div>
              </Card>
            ))}

            {specifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No specifications added yet. Click "Add Specification" to get started.</p>
              </div>
            )}
          </div>

          <FormActions
            loading={formState.isLoading}
            submitLabel={submitLabel}
            onCancel={onCancel}
          />
        </Form>
      </CardContent>
    </Card>
  )
}