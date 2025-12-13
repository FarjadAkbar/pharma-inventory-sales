"use client"

import { useState } from "react"
import { Form, FormInput, FormSelect, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import type { Site } from "@/services/sites-api.service"

interface SiteFormProps {
  initialData?: Partial<Site>
  onSubmit: (data: {
    name: string
    address?: string
    city?: string
    country?: string
    type?: 'hospital' | 'clinic' | 'pharmacy' | 'warehouse' | 'manufacturing'
    isActive?: boolean
  }) => Promise<void>
  submitLabel?: string
}

const SITE_TYPES: Array<{ value: string; label: string }> = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'manufacturing', label: 'Manufacturing' },
]

export function SiteForm({ initialData, onSubmit, submitLabel = "Save" }: SiteFormProps) {
  const initialFormData = {
    name: initialData?.name || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    country: initialData?.country || "",
    type: initialData?.type || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    name: {
      required: true,
      message: "Site name is required"
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

      await onSubmit({
        name: data.name,
        address: data.address || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        type: data.type ? data.type as 'hospital' | 'clinic' | 'pharmacy' | 'warehouse' | 'manufacturing' : undefined,
        isActive: data.isActive,
      })
      
      formState.setSuccess("Site saved successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save site"
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
          name="name"
          label="Site Name"
          value={formState.data.name}
          onChange={(e) => formState.updateField('name', e.target.value)}
          error={formState.errors.name}
          required
        />
        <FormSelect
          name="type"
          label="Site Type"
          value={formState.data.type}
          onChange={(e) => formState.updateField('type', e.target.value)}
          error={formState.errors.type}
          options={SITE_TYPES}
          placeholder="Select site type"
        />
      </div>

      <FormInput
        name="address"
        label="Address"
        value={formState.data.address}
        onChange={(e) => formState.updateField('address', e.target.value)}
        error={formState.errors.address}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          name="city"
          label="City"
          value={formState.data.city}
          onChange={(e) => formState.updateField('city', e.target.value)}
          error={formState.errors.city}
        />
        <FormInput
          name="country"
          label="Country"
          value={formState.data.country}
          onChange={(e) => formState.updateField('country', e.target.value)}
          error={formState.errors.country}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formState.data.isActive}
          onChange={(e) => formState.updateField('isActive', e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Active
        </label>
      </div>

      <FormActions 
        loading={formState.isLoading}
        submitLabel={submitLabel}
      />
    </Form>
  )
}
