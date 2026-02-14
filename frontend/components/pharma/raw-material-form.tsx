"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, pharmaValidationRules } from "@/lib/form-validation"

interface RawMaterial {
  id?: string
  code: string
  name: string
  description: string
  grade: string
  unit: string
  supplierId: string
  storageRequirements: string
  isActive: boolean
}

interface Supplier {
  id: string
  name: string
}

interface RawMaterialFormProps {
  initialData?: Partial<RawMaterial>
  onSubmit: (data: RawMaterial) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
}

const GRADES = [
  "USP", "BP", "EP", "JP", "IP", "ACS", "AR", "LR", "CP", "Food Grade", "Technical Grade"
]

const UNITS_OF_MEASURE = [
  "kg", "g", "mg", "L", "ml", "mcg", "IU", "units", "pieces", "vials", "ampoules"
]

const STORAGE_REQUIREMENTS = [
  "Room Temperature", "Refrigerated (2-8°C)", "Frozen (-20°C)", "Controlled Room Temperature",
  "Protect from Light", "Protect from Moisture", "Protect from Heat", "Inert Atmosphere"
]

export function RawMaterialForm({ initialData, onSubmit, submitLabel = "Save", onCancel }: RawMaterialFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  
  const initialFormData: RawMaterial = {
    code: initialData?.code || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    grade: initialData?.grade || "",
    unit: initialData?.unit || "",
    supplierId: initialData?.supplierId || "",
    storageRequirements: initialData?.storageRequirements || "",
    isActive: initialData?.isActive ?? true,
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...pharmaValidationRules,
    grade: {
      required: true,
      message: "Please select a grade"
    },
    unit: {
      required: true,
      message: "Please select a unit of measure"
    },
    supplierId: {
      required: true,
      message: "Please select a supplier"
    },
    storageRequirements: {
      required: true,
      message: "Please select storage requirements"
    }
  })

  // Load suppliers on mount
  useState(() => {
    const loadSuppliers = async () => {
      try {
        // Mock data for now - replace with actual API call
        setSuppliers([
          { id: "1", name: "Chemical Supply Co." },
          { id: "2", name: "Pharma Ingredients Ltd" },
          { id: "3", name: "Raw Materials Inc" },
          { id: "4", name: "Chemical Solutions" }
        ])
      } catch (error) {
        console.error("Failed to load suppliers:", error)
      }
    }
    
    loadSuppliers()
  })

  const handleSubmit = async (data: any) => {
    formState.setLoading(true)
    formState.clearErrors()
    
    try {
      // Validate form
      const errors = validation.validateForm(data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      const materialData: RawMaterial = {
        code: data.code,
        name: data.name,
        description: data.description,
        grade: data.grade,
        unit: data.unit,
        supplierId: data.supplierId,
        storageRequirements: data.storageRequirements,
        isActive: data.isActive === "true" || data.isActive === true,
      }

      await onSubmit(materialData)
      formState.setSuccess("Raw material saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save raw material")
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Material Details</CardTitle>
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
              label="Material Code"
              value={formState.data.code}
              onChange={(e) => formState.updateField('code', e.target.value.toUpperCase())}
              error={formState.errors.code}
              required
              placeholder="e.g., RM-001"
            />
            <FormInput
              name="name"
              label="Material Name"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
            />
          </div>

          <FormTextarea
            name="description"
            label="Description"
            value={formState.data.description}
            onChange={(e) => formState.updateField('description', e.target.value)}
            error={formState.errors.description}
            rows={3}
            placeholder="Detailed description of the raw material"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="grade"
              label="Grade"
              value={formState.data.grade}
              onChange={(e) => formState.updateField('grade', e.target.value)}
              error={formState.errors.grade}
              required
              options={GRADES.map(grade => ({ value: grade, label: grade }))}
              placeholder="Select grade"
            />
            <FormSelect
              name="unit"
              label="Unit of Measure"
              value={formState.data.unit}
              onChange={(e) => formState.updateField('unit', e.target.value)}
              error={formState.errors.unit}
              required
              options={UNITS_OF_MEASURE.map(unit => ({ value: unit, label: unit }))}
              placeholder="Select unit"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="supplierId"
              label="Supplier"
              value={formState.data.supplierId}
              onChange={(e) => formState.updateField('supplierId', e.target.value)}
              error={formState.errors.supplierId}
              required
              options={suppliers.map(supplier => ({ value: supplier.id, label: supplier.name }))}
              placeholder="Select supplier"
            />
            <FormSelect
              name="storageRequirements"
              label="Storage Requirements"
              value={formState.data.storageRequirements}
              onChange={(e) => formState.updateField('storageRequirements', e.target.value)}
              error={formState.errors.storageRequirements}
              required
              options={STORAGE_REQUIREMENTS.map(req => ({ value: req, label: req }))}
              placeholder="Select storage requirements"
            />
          </div>

          <FormSelect
            name="isActive"
            label="Status"
            value={formState.data.isActive.toString()}
            onChange={(e) => formState.updateField('isActive', e.target.value === "true")}
            error={formState.errors.isActive}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" }
            ]}
          />

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
