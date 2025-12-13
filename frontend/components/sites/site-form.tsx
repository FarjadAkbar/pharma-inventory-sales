"use client"

import { useState, useEffect } from "react"
import { Form, FormInput, FormSelect, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import { sitesApi, type Site } from "@/services"
import { Switch } from "@/components/ui/switch"

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

// Color mapping for site types (frontend only)
const SITE_TYPE_COLORS: Record<string, string> = {
  hospital: 'bg-blue-100 text-blue-800',
  clinic: 'bg-green-100 text-green-800',
  pharmacy: 'bg-purple-100 text-purple-800',
  warehouse: 'bg-orange-100 text-orange-800',
  manufacturing: 'bg-red-100 text-red-800',
}

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function SiteForm({ initialData, onSubmit, submitLabel = "Save" }: SiteFormProps) {
  const [siteTypes, setSiteTypes] = useState<string[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  useEffect(() => {
    const fetchSiteTypes = async () => {
      try {
        setLoadingTypes(true)
        const types = await sitesApi.getSiteTypes()
        setSiteTypes(types)
      } catch (error) {
        console.error("Failed to fetch site types:", error)
        // Fallback to default types if API fails
        setSiteTypes(['hospital', 'clinic', 'pharmacy', 'warehouse', 'manufacturing'])
      } finally {
        setLoadingTypes(false)
      }
    }
    fetchSiteTypes()
  }, [])
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
        isActive: formState.data.isActive,
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
          onChange={(value) => formState.updateField('type', value)}
          error={formState.errors.type}
          options={siteTypes.map(t => ({ value: t, label: capitalizeFirst(t) }))}
          placeholder={loadingTypes ? "Loading types..." : "Select site type"}
          disabled={loadingTypes}
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
          type="hidden"
          name="isActive"
          value={formState.data.isActive ? "true" : "false"}
        />
        <Switch
          id="isActive"
          checked={formState.data.isActive}
          onCheckedChange={(checked) => formState.updateField('isActive', checked)}
        />
        <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
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
