"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import type { User } from "@/types/auth"
import { useStore } from "@/contexts/store.context"

type ScreenPermission = { screen: string; actions: string[] }

interface UserFormProps {
  initialData?: Partial<User> & { screenPermissions?: ScreenPermission[] }
  onSubmit: (data: {
    name: string
    email: string
    role: "admin" | "store_manager" | "employee"
    assignedStores: string[]
    screenPermissions: ScreenPermission[]
  }) => Promise<void>
  submitLabel?: string
}

export function UserForm({ initialData, onSubmit, submitLabel = "Save" }: UserFormProps) {
  const { stores } = useStore()
  
  const initialFormData = {
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: (initialData?.role as any) || ("employee" as const),
    assignedStores: (initialData as any)?.assignedStores || ([] as string[]),
    screenPermissions: (initialData as any)?.screenPermissions || ([] as ScreenPermission[]),
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    role: {
      required: true,
      message: "Please select a role"
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
        email: data.email,
        role: data.role,
        assignedStores: data.assignedStores ? [data.assignedStores] : [],
        screenPermissions: formState.data.screenPermissions
      })
      
      formState.setSuccess("User saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save user")
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Details</CardTitle>
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
              label="Full Name"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
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

          <FormSelect
            name="role"
            label="Role"
            value={formState.data.role}
            onChange={(e) => formState.updateField('role', e.target.value)}
            error={formState.errors.role}
            required
            options={[
              { value: "employee", label: "Employee" },
              { value: "store_manager", label: "Store Manager" },
              { value: "admin", label: "Admin" }
            ]}
            placeholder="Select a role"
          />

          <FormSelect
            name="assignedStores"
            label="Assign Store"
            value={formState.data.assignedStores[0] || ""}
            onChange={(e) => formState.updateField('assignedStores', e.target.value ? [e.target.value] : [])}
            error={formState.errors.assignedStores}
            options={stores.map(store => ({ value: store.id, label: store.name }))}
            placeholder="Select a store"
          />

          <div className="space-y-3">
            <label className="text-sm font-medium">Screen Permissions</label>
            <div className="space-y-2">
              {[
                "dashboard",
                "products",
                "vendors",
                "categories",
                "sales",
                "pos",
                "users",
                "stores",
              ].map((screen) => {
                const current = (formState.data.screenPermissions || []).find((sp) => sp.screen === screen)
                const actions = ["view", "create", "edit", "delete"]
                return (
                  <div key={screen} className="flex items-center gap-4">
                    <div className="w-32 capitalize text-sm">{screen}</div>
                    <div className="flex gap-4 text-sm">
                      {actions.map((action) => {
                        const checked = current?.actions.includes(action)
                        return (
                          <FormCheckbox
                            key={action}
                            checked={!!checked}
                            onChange={(e) => {
                              const existing = formState.data.screenPermissions.find((sp) => sp.screen === screen)
                              let next = [...formState.data.screenPermissions]
                              if (!existing) {
                                next.push({ screen, actions: e.target.checked ? [action] : [] })
                              } else {
                                existing.actions = e.target.checked
                                  ? Array.from(new Set([...(existing.actions || []), action]))
                                  : (existing.actions || []).filter((a: string) => a !== action)
                                next = next.map((sp) => (sp.screen === screen ? existing : sp))
                              }
                              formState.updateField('screenPermissions', next)
                            }}
                            label={action}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <FormActions 
            loading={formState.isLoading}
            submitLabel={submitLabel}
          />
        </Form>
      </CardContent>
    </Card>
  )
}


