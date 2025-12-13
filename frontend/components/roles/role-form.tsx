"use client"

import { useState, useEffect } from "react"
import { Form, FormInput, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import { rolesApi, permissionsApi } from "@/services"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

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

  const togglePermission = (permissionId: number) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
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

            <div className="space-y-3">
              <Label className="text-sm font-medium">Permissions</Label>
              {loadingPermissions ? (
                <div className="text-sm text-muted-foreground">Loading permissions...</div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto border rounded-md p-4">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="space-y-2">
                      <div className="font-medium text-sm text-muted-foreground capitalize">
                        {resource}
                      </div>
                      <div className="space-y-2 pl-4">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={selectedPermissionIds.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <Label
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {permission.name}
                              {permission.description && (
                                <span className="text-muted-foreground ml-2">
                                  - {permission.description}
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {permissions.length === 0 && (
                    <div className="text-sm text-muted-foreground">No permissions available</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <FormActions 
            loading={formState.isLoading}
            submitLabel={submitLabel}
          />
        </Form>
  )
}

