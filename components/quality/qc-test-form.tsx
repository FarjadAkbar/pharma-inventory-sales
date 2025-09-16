"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import type { QCTest } from "@/types/quality-control"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, TestTube } from "lucide-react"

interface QCSpecification {
  parameter: string
  specification: string
  unit: string
  type: string
  description?: string
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
  const initialFormData = {
    code: initialData?.code || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    method: initialData?.method || "",
    unit: initialData?.unit || "",
    equipmentRequired: initialData?.equipmentRequired || "",
    duration: initialData?.duration || "",
    temperature: initialData?.temperature || "",
    isActive: initialData?.isActive ?? true,
    notes: initialData?.notes || "",
    specifications: initialData?.specifications || []
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    code: {
      required: true,
      message: "Please enter a test code"
    },
    name: {
      required: true,
      message: "Please enter a test name"
    },
    category: {
      required: true,
      message: "Please select a category"
    },
    method: {
      required: true,
      message: "Please enter a test method"
    },
    unit: {
      required: true,
      message: "Please enter a unit of measurement"
    }
  })

  const [specifications, setSpecifications] = useState<QCSpecification[]>(initialFormData.specifications)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      await onSubmit({
        ...formState.data,
        specifications,
        createdById: "1", // Mock user ID
        createdByName: "Current User", // Mock user name
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as QCTest)

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
      specification: "",
      unit: "",
      type: "Numeric",
      description: ""
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

  const specTypes = [
    { value: "Numeric", label: "Numeric" },
    { value: "Text", label: "Text" },
    { value: "Boolean", label: "Boolean" },
    { value: "Range", label: "Range" }
  ]

  const units = [
    { value: "%", label: "Percentage (%)" },
    { value: "mg", label: "Milligram (mg)" },
    { value: "g", label: "Gram (g)" },
    { value: "ml", label: "Milliliter (ml)" },
    { value: "L", label: "Liter (L)" },
    { value: "°C", label: "Celsius (°C)" },
    { value: "pH", label: "pH" },
    { value: "min", label: "Minutes (min)" },
    { value: "hr", label: "Hours (hr)" },
    { value: "days", label: "Days" },
    { value: "N/A", label: "Not Applicable" }
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
          error={formState.error}
          success={formState.success}
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
              onChange={(e) => formState.updateField('category', e.target.value)}
              error={formState.errors.category}
              required
              options={categories}
              placeholder="Select category"
            />

            <FormInput
              name="method"
              label="Test Method"
              value={formState.data.method}
              onChange={(e) => formState.updateField('method', e.target.value)}
              error={formState.errors.method}
              required
              placeholder="e.g., HPLC"
            />

            <FormSelect
              name="unit"
              label="Unit of Measurement"
              value={formState.data.unit}
              onChange={(e) => formState.updateField('unit', e.target.value)}
              error={formState.errors.unit}
              required
              options={units}
              placeholder="Select unit"
            />

            <FormInput
              name="equipmentRequired"
              label="Equipment Required"
              value={formState.data.equipmentRequired}
              onChange={(e) => formState.updateField('equipmentRequired', e.target.value)}
              placeholder="e.g., HPLC, UV-Vis Spectrophotometer"
            />

            <FormInput
              name="duration"
              label="Test Duration"
              value={formState.data.duration}
              onChange={(e) => formState.updateField('duration', e.target.value)}
              placeholder="e.g., 30 minutes"
            />

            <FormInput
              name="temperature"
              label="Temperature"
              value={formState.data.temperature}
              onChange={(e) => formState.updateField('temperature', e.target.value)}
              placeholder="e.g., 25°C ± 2°C"
            />
          </div>

          <FormInput
            name="description"
            label="Description"
            value={formState.data.description}
            onChange={(e) => formState.updateField('description', e.target.value)}
            placeholder="Detailed description of the test method"
            multiline
            rows={3}
          />

          <FormCheckbox
            name="isActive"
            label="Active Test"
            checked={formState.data.isActive}
            onChange={(e) => formState.updateField('isActive', e.target.checked)}
          />

          <FormInput
            name="notes"
            label="Notes"
            value={formState.data.notes}
            onChange={(e) => formState.updateField('notes', e.target.value)}
            placeholder="Additional notes or special instructions"
            multiline
            rows={2}
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
                    label="Parameter"
                    value={spec.parameter}
                    onChange={(e) => updateSpecification(index, 'parameter', e.target.value)}
                    placeholder="e.g., Assay"
                    required
                  />

                  <FormInput
                    name={`specification_${index}`}
                    label="Specification"
                    value={spec.specification}
                    onChange={(e) => updateSpecification(index, 'specification', e.target.value)}
                    placeholder="e.g., 95.0-105.0"
                    required
                  />

                  <FormSelect
                    name={`unit_${index}`}
                    label="Unit"
                    value={spec.unit}
                    onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                    options={units}
                    placeholder="Select unit"
                  />

                  <FormSelect
                    name={`type_${index}`}
                    label="Type"
                    value={spec.type}
                    onChange={(e) => updateSpecification(index, 'type', e.target.value)}
                    options={specTypes}
                    placeholder="Select type"
                  />

                  <div className="md:col-span-2">
                    <FormInput
                      name={`description_${index}`}
                      label="Description"
                      value={spec.description || ''}
                      onChange={(e) => updateSpecification(index, 'description', e.target.value)}
                      placeholder="Parameter description"
                    />
                  </div>
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