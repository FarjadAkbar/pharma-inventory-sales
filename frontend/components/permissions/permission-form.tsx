"use client"

import { useState } from "react"
import { Form, FormInput, FormSelect, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"

interface Permission {
  id: number
  name: string
  description?: string
  resource?: string
  action?: string
}

interface PermissionFormProps {
  initialData?: Permission
  onSubmit: (data: {
    name: string
    description?: string
    resource?: string
    action?: string
  }) => Promise<void>
  submitLabel?: string
}

const RESOURCE_OPTIONS = [
  { value: "identity", label: "Identity & Authentication" },
  { value: "master", label: "Master Data" },
  { value: "procurement", label: "Procurement" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "quality", label: "Quality Control/Assurance" },
  { value: "warehouse", label: "Warehouse" },
  { value: "distribution", label: "Distribution" },
  { value: "sales", label: "Sales/CRM" },
  { value: "regulatory", label: "Regulatory" },
  { value: "reporting", label: "Reporting" },
  { value: "other", label: "Other" },
]

const ACTION_OPTIONS = [
  { value: "view", label: "View" },
  { value: "create", label: "Create" },
  { value: "edit", label: "Edit" },
  { value: "delete", label: "Delete" },
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "other", label: "Other" },
]

export function PermissionForm({ initialData, onSubmit, submitLabel = "Save" }: PermissionFormProps) {
  const initialFormData = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    resource: initialData?.resource || "",
    action: initialData?.action || "",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    name: {
      required: true,
      message: "Permission name is required"
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

      await onSubmit({
        name: data.name,
        description: data.description || undefined,
        resource: data.resource || undefined,
        action: data.action || undefined,
      })
      
      formState.setSuccess("Permission saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save permission")
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
      <div className="space-y-4">
        <FormInput
          name="name"
          label="Permission Name"
          value={formState.data.name}
          onChange={(e) => formState.updateField('name', e.target.value)}
          error={formState.errors.name}
          required
          placeholder="e.g., view_users, create_products"
        />
        
        <FormInput
          name="description"
          label="Description"
          value={formState.data.description || ""}
          onChange={(e) => formState.updateField('description', e.target.value)}
          error={formState.errors.description}
          placeholder="Brief description of the permission"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormSelect
            name="resource"
            label="Resource"
            value={formState.data.resource || ""}
            onChange={(e) => formState.updateField('resource', e.target.value)}
            error={formState.errors.resource}
            options={RESOURCE_OPTIONS}
            placeholder="Select resource"
          />

          <FormSelect
            name="action"
            label="Action"
            value={formState.data.action || ""}
            onChange={(e) => formState.updateField('action', e.target.value)}
            error={formState.errors.action}
            options={ACTION_OPTIONS}
            placeholder="Select action"
          />
        </div>
      </div>

      <FormActions 
        loading={formState.isLoading}
        submitLabel={submitLabel}
      />
    </Form>
  )
}

