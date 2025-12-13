"use client"

import { useState, useEffect } from "react"
import { Form, FormInput, FormActions, FormField } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import { rolesApi, permissionsApi } from "@/services"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectGroup,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"

interface Role {
  id: number
  name: string
  description?: string
  permissions?: Array<{
    id: number
    name: string
    description?: string
    resource?: string
    action?: string
  }>
}

interface Permission {
  id: number
  name: string
  description?: string
  resource?: string
  action?: string
}

interface RoleFormProps {
  initialData?: Role
  onSubmit: (data: {
    name: string
    description?: string
    permissionIds: number[]
  }) => Promise<void>
  submitLabel?: string
}

export function RoleForm({ initialData, onSubmit, submitLabel = "Save" }: RoleFormProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)

  const initialFormData = {
    name: initialData?.name || "",
    description: initialData?.description || "",
  }

  // Initialize selected permissions from initialData
  useEffect(() => {
    if (initialData?.permissions) {
      setSelectedPermissionIds(initialData.permissions.map(p => p.id))
    }
  }, [initialData])

  // Fetch all permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoadingPermissions(true)
        const response = await permissionsApi.getPermissions()
        const permissionsData = Array.isArray(response) ? response : (response?.docs || response?.data || [])
        setPermissions(permissionsData)
      } catch (error) {
        console.error("Failed to fetch permissions:", error)
      } finally {
        setLoadingPermissions(false)
      }
    }
    fetchPermissions()
  }, [])

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    name: {
      required: true,
      message: "Role name is required"
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
        permissionIds: selectedPermissionIds,
      })
      
      formState.setSuccess("Role saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save role")
    } finally {
      formState.setLoading(false)
    }
  }

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resource = permission.resource || "Other"
    if (!acc[resource]) {
      acc[resource] = []
    }
    acc[resource].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

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
              label="Role Name"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
            />
            
            <FormInput
              name="description"
              label="Description"
              value={formState.data.description}
              onChange={(e) => formState.updateField('description', e.target.value)}
              error={formState.errors.description}
            />

            <FormField
              label="Permissions"
              name="permissionIds"
              helpText={permissions.length === 0 ? "No permissions available" : undefined}
            >
              {loadingPermissions ? (
                <div className="text-sm text-muted-foreground">Loading permissions...</div>
              ) : (
                <>
                  <input
                    type="hidden"
                    name="permissionIds"
                    value={JSON.stringify(selectedPermissionIds)}
                  />
                  <MultiSelect
                    values={selectedPermissionIds.map(id => id.toString())}
                    onValuesChange={(values) => {
                      setSelectedPermissionIds(values.map(v => parseInt(v, 10)))
                    }}
                  >
                    <MultiSelectTrigger className="w-full">
                      <MultiSelectValue placeholder="Select permissions..." />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      {Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <MultiSelectGroup key={resource} heading={resource.charAt(0).toUpperCase() + resource.slice(1)}>
                          {perms.map((permission) => (
                            <MultiSelectItem
                              key={permission.id}
                              value={permission.id.toString()}
                              badgeLabel={permission.name}
                            >
                              {permission.name}
                              {permission.description && (
                                <span className="text-muted-foreground ml-2">
                                  - {permission.description}
                                </span>
                              )}
                            </MultiSelectItem>
                          ))}
                        </MultiSelectGroup>
                      ))}
                    </MultiSelectContent>
                  </MultiSelect>
                </>
              )}
            </FormField>
          </div>

          <FormActions 
            loading={formState.isLoading}
            submitLabel={submitLabel}
          />
        </Form>
  )
}

