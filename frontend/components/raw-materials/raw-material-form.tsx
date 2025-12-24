"use client"

import { useState, useEffect, useMemo } from "react"
import { Form, FormInput, FormTextarea, FormSelect, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import { rawMaterialsApi, suppliersApi, type RawMaterial } from "@/services"
import { Switch } from "@/components/ui/switch"
import { getUnitOptions } from "@/lib/constants"

interface RawMaterialFormProps {
  initialData?: Partial<RawMaterial>
  onSubmit: (data: {
    code: string
    name: string
    description?: string
    grade?: string
    storageRequirements?: string
    unitOfMeasure?: string
    supplierId: number
    status?: 'Active' | 'InActive'
  }) => Promise<void>
  submitLabel?: string
}

export function RawMaterialForm({ initialData, onSubmit, submitLabel = "Save" }: RawMaterialFormProps) {
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true)
        const suppliersData = await suppliersApi.getSuppliers()
        setSuppliers(suppliersData.map((supplier: { id: number; name: string }) => ({ id: supplier.id, name: supplier.name })))
      } catch (error) {
        console.error("Failed to fetch suppliers:", error)
      } finally {
        setLoadingSuppliers(false)
      }
    }
    fetchSuppliers()
  }, [])

  const initialFormData = {
    code: initialData?.code || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    grade: initialData?.grade || "",
    storageRequirements: initialData?.storageRequirements || "",
    unitOfMeasure: initialData?.unitOfMeasure || "",
    supplierId: initialData?.supplierId?.toString() || "",
    status: initialData?.status || "Active",
  }

  // Get unit options, including custom unit if present in initialData
  const unitOptions = useMemo(() => {
    return getUnitOptions(initialData?.unitOfMeasure)
  }, [initialData?.unitOfMeasure])

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    code: {
      required: true,
      message: "Code is required"
    },
    name: {
      required: true,
      message: "Name is required"
    },
    supplierId: {
      required: true,
      message: "Supplier is required"
    }
  })

  const handleSubmit = async (data: typeof initialFormData) => {
    formState.setLoading(true)
    formState.clearErrors()
    
    try {
      const errors = validation.validateForm(data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      if (!data.supplierId) {
        formState.setError("Supplier is required")
        return
      }

      await onSubmit({
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || undefined,
        grade: data.grade || undefined,
        storageRequirements: data.storageRequirements || undefined,
        unitOfMeasure: data.unitOfMeasure || undefined,
        supplierId: parseInt(data.supplierId, 10),
        status: data.status as 'Active' | 'InActive',
      })
      
      formState.setSuccess("Raw material saved successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save raw material"
      formState.setError(errorMessage)
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <Form 
      onSubmit={handleSubmit} 
      loading={formState.isLoading}
      error={formState.error || undefined}
      success={formState.success || undefined}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          name="code"
          label="Code"
          value={formState.data.code}
          onChange={(e) => formState.updateField('code', e.target.value.toUpperCase())}
          error={formState.errors.code}
          required
        />
        <FormInput
          name="name"
          label="Name"
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
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          name="grade"
          label="Grade"
          value={formState.data.grade}
          onChange={(e) => formState.updateField('grade', e.target.value)}
          error={formState.errors.grade}
          placeholder="e.g., USP, BP, EP"
        />
        <FormInput
          name="storageRequirements"
          label="Storage Requirements"
          value={formState.data.storageRequirements}
          onChange={(e) => formState.updateField('storageRequirements', e.target.value)}
          error={formState.errors.storageRequirements}
          placeholder="e.g., Room temperature, Refrigerated"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormSelect
          name="unitOfMeasure"
          label="Unit of Measure"
          value={formState.data.unitOfMeasure}
          onChange={(value) => formState.updateField('unitOfMeasure', value)}
          error={formState.errors.unitOfMeasure}
          options={unitOptions}
          placeholder="Select unit of measure"
        />
        <FormSelect
          name="supplierId"
          label="Supplier"
          value={formState.data.supplierId}
          onChange={(value) => formState.updateField('supplierId', value)}
          error={formState.errors.supplierId}
          options={suppliers.map(s => ({ value: s.id.toString(), label: s.name }))}
          placeholder={loadingSuppliers ? "Loading suppliers..." : "Select supplier"}
          disabled={loadingSuppliers}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="hidden"
          name="status"
          value={formState.data.status}
        />
        <Switch
          id="status"
          checked={formState.data.status === "Active"}
          onCheckedChange={(checked) => formState.updateField('status', checked ? "Active" : "InActive")}
        />
        <label htmlFor="status" className="text-sm font-medium cursor-pointer">
          {formState.data.status === "Active" ? "Active" : "Inactive"}
        </label>
      </div>

      <FormActions 
        loading={formState.isLoading}
        submitLabel={submitLabel}
      />
    </Form>
  )
}
