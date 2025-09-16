"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"

interface Supplier {
  id?: string
  name: string
  code: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  website: string
  rating: number
  isActive: boolean
}

interface SupplierFormProps {
  initialData?: Partial<Supplier>
  onSubmit: (data: Supplier) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
}

const COUNTRIES = [
  "Pakistan", "India", "China", "USA", "UK", "Germany", "France", "Japan", 
  "South Korea", "Singapore", "Malaysia", "Thailand", "UAE", "Saudi Arabia"
]

const RATINGS = [
  { value: "1", label: "1 Star - Poor" },
  { value: "2", label: "2 Stars - Below Average" },
  { value: "3", label: "3 Stars - Average" },
  { value: "4", label: "4 Stars - Good" },
  { value: "5", label: "5 Stars - Excellent" }
]

export function SupplierForm({ initialData, onSubmit, submitLabel = "Save", onCancel }: SupplierFormProps) {
  const initialFormData: Supplier = {
    name: initialData?.name || "",
    code: initialData?.code || "",
    contactPerson: initialData?.contactPerson || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "",
    postalCode: initialData?.postalCode || "",
    website: initialData?.website || "",
    rating: initialData?.rating || 3,
    isActive: initialData?.isActive ?? true,
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    code: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[A-Z0-9_-]+$/,
      message: "Code must be 3-20 characters, uppercase letters, numbers, hyphens, and underscores only"
    },
    contactPerson: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: "Contact person name must be between 2 and 50 characters"
    },
    city: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: "City must be between 2 and 50 characters"
    },
    state: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: "State must be between 2 and 50 characters"
    },
    country: {
      required: true,
      message: "Please select a country"
    },
    postalCode: {
      required: true,
      minLength: 3,
      maxLength: 10,
      message: "Postal code must be between 3 and 10 characters"
    },
    website: {
      pattern: /^https?:\/\/.+/,
      message: "Website must be a valid URL starting with http:// or https://"
    },
    rating: {
      required: true,
      custom: (value) => {
        const num = Number(value)
        if (isNaN(num) || num < 1 || num > 5) {
          return "Rating must be between 1 and 5"
        }
        return null
      }
    }
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

      const supplierData: Supplier = {
        name: data.name,
        code: data.code,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        website: data.website,
        rating: Number(data.rating),
        isActive: data.isActive === "true" || data.isActive === true,
      }

      await onSubmit(supplierData)
      formState.setSuccess("Supplier saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save supplier")
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Details</CardTitle>
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
              name="name"
              label="Supplier Name"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
            />
            <FormInput
              name="code"
              label="Supplier Code"
              value={formState.data.code}
              onChange={(e) => formState.updateField('code', e.target.value.toUpperCase())}
              error={formState.errors.code}
              required
              placeholder="e.g., SUP-001"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              name="contactPerson"
              label="Contact Person"
              value={formState.data.contactPerson}
              onChange={(e) => formState.updateField('contactPerson', e.target.value)}
              error={formState.errors.contactPerson}
              required
            />
            <FormInput
              name="email"
              label="Email"
              type="email"
              value={formState.data.email}
              onChange={(e) => formState.updateField('email', e.target.value)}
              error={formState.errors.email}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              name="phone"
              label="Phone"
              value={formState.data.phone}
              onChange={(e) => formState.updateField('phone', e.target.value)}
              error={formState.errors.phone}
              required
            />
            <FormInput
              name="website"
              label="Website"
              type="url"
              value={formState.data.website}
              onChange={(e) => formState.updateField('website', e.target.value)}
              error={formState.errors.website}
              placeholder="https://example.com"
            />
          </div>

          <FormTextarea
            name="address"
            label="Address"
            value={formState.data.address}
            onChange={(e) => formState.updateField('address', e.target.value)}
            error={formState.errors.address}
            rows={2}
            placeholder="Street address"
          />

          <div className="grid md:grid-cols-3 gap-4">
            <FormInput
              name="city"
              label="City"
              value={formState.data.city}
              onChange={(e) => formState.updateField('city', e.target.value)}
              error={formState.errors.city}
              required
            />
            <FormInput
              name="state"
              label="State/Province"
              value={formState.data.state}
              onChange={(e) => formState.updateField('state', e.target.value)}
              error={formState.errors.state}
              required
            />
            <FormInput
              name="postalCode"
              label="Postal Code"
              value={formState.data.postalCode}
              onChange={(e) => formState.updateField('postalCode', e.target.value)}
              error={formState.errors.postalCode}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="country"
              label="Country"
              value={formState.data.country}
              onChange={(e) => formState.updateField('country', e.target.value)}
              error={formState.errors.country}
              required
              options={COUNTRIES.map(country => ({ value: country, label: country }))}
              placeholder="Select country"
            />
            <FormSelect
              name="rating"
              label="Rating"
              value={formState.data.rating.toString()}
              onChange={(e) => formState.updateField('rating', Number(e.target.value))}
              error={formState.errors.rating}
              required
              options={RATINGS}
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
