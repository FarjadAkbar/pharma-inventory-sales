"use client"

import { useState, useEffect } from "react"
import { Form, FormInput, FormSelect, FormActions, FormField } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import { suppliersApi, sitesApi, type Supplier } from "@/services"
import { Switch } from "@/components/ui/switch"
import { MultiSelect, MultiSelectTrigger, MultiSelectValue, MultiSelectContent, MultiSelectItem, MultiSelectGroup } from "@/components/ui/multi-select"

interface SupplierFormProps {
  initialData?: Partial<Supplier>
  onSubmit: (data: {
    name: string
    contactPerson: string
    email: string
    phone: string
    address: string
    rating?: number
    status?: 'Active' | 'Inactive'
    siteIds?: number[]
  }) => Promise<void>
  submitLabel?: string
}

export function SupplierForm({ initialData, onSubmit, submitLabel = "Save" }: SupplierFormProps) {
  const [sites, setSites] = useState<Array<{ id: number; name: string }>>([])
  const [loadingSites, setLoadingSites] = useState(true)
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([])

  useEffect(() => {
  const fetchSites = async () => {
    try {
        setLoadingSites(true)
        const sitesData = await sitesApi.getSites()
        setSites(sitesData.map((site: { id: number; name: string }) => ({ id: site.id, name: site.name })))
        
        // Set initial selected sites
        if (initialData?.siteIds && initialData.siteIds.length > 0) {
          setSelectedSiteIds(initialData.siteIds.map(id => id.toString()))
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
      } finally {
        setLoadingSites(false)
      }
    }
    fetchSites()
  }, [initialData?.siteIds])

  const initialFormData = {
    name: initialData?.name || "",
    contactPerson: initialData?.contactPerson || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    rating: initialData?.rating?.toString() || "0",
    status: initialData?.status || "Active",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    name: {
      required: true,
      message: "Supplier name is required"
    },
    contactPerson: {
      required: true,
      message: "Contact person is required"
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Valid email is required"
    },
    phone: {
      required: true,
      message: "Phone number is required"
    },
    address: {
      required: true,
      message: "Address is required"
    },
    rating: {
      pattern: /^(0|([1-4](\.[0-9])?)|5(\.0)?)$/,
      message: "Rating must be between 0 and 5"
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
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        rating: parseFloat(data.rating) || 0,
        status: data.status as 'Active' | 'Inactive',
        siteIds: selectedSiteIds.length > 0 ? selectedSiteIds.map(id => parseInt(id, 10)) : undefined,
      })
      
      formState.setSuccess("Supplier saved successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save supplier"
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
          label="Supplier Name"
          value={formState.data.name}
          onChange={(e) => formState.updateField('name', e.target.value)}
          error={formState.errors.name}
                required
              />
        <FormInput
          name="contactPerson"
          label="Contact Person"
          value={formState.data.contactPerson}
          onChange={(e) => formState.updateField('contactPerson', e.target.value)}
          error={formState.errors.contactPerson}
              required
            />
          </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          name="email"
          label="Email"
          type="email"
          value={formState.data.email}
          onChange={(e) => formState.updateField('email', e.target.value)}
          error={formState.errors.email}
          required
        />
        <FormInput
          name="phone"
          label="Phone"
          value={formState.data.phone}
          onChange={(e) => formState.updateField('phone', e.target.value)}
          error={formState.errors.phone}
              required
            />
          </div>

      <FormInput
        name="address"
        label="Address"
        value={formState.data.address}
        onChange={(e) => formState.updateField('address', e.target.value)}
        error={formState.errors.address}
              required
            />

      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          name="rating"
          label="Rating (0-5)"
                type="number"
                min="0"
                max="5"
                step="0.1"
          value={formState.data.rating}
          onChange={(e) => formState.updateField('rating', e.target.value)}
          error={formState.errors.rating}
        />
        <FormSelect
          name="status"
          label="Status"
          value={formState.data.status}
          onChange={(value) => formState.updateField('status', value)}
          error={formState.errors.status}
          options={[
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
              />
            </div>

      <FormField name="siteIds" label="Sites">
        <input
          type="hidden"
          name="siteIds"
          value={selectedSiteIds.join(',')}
        />
        <MultiSelect
          values={selectedSiteIds}
          defaultValues={selectedSiteIds}
          onValuesChange={setSelectedSiteIds}
        >
          <MultiSelectTrigger disabled={loadingSites}>
            <MultiSelectValue placeholder={loadingSites ? "Loading sites..." : "Select sites"} />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectGroup>
              {sites.map((site) => (
                <MultiSelectItem key={site.id} value={site.id.toString()}>
                  {site.name}
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>
      </FormField>

      <FormActions 
        loading={formState.isLoading}
        submitLabel={submitLabel}
      />
    </Form>
  )
}
