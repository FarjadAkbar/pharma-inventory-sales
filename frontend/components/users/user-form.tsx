"use client"

import { useState, useEffect } from "react"
import { Form, FormField, FormInput, FormSelect, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import type { User } from "@/types/auth"
import { rolesApi, sitesApi } from "@/services"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"

interface UserFormProps {
  initialData?: Partial<User>
  onSubmit: (data: {
    name: string
    email: string
    password?: string
    roleId?: number
    siteIds: number[]
  }) => Promise<void>
  submitLabel?: string
}

interface Role {
  id: number
  name: string
  description?: string
}

interface Site {
  id: number
  name: string
  address?: string
  city?: string
  type?: string
}

export function UserForm({ initialData, onSubmit, submitLabel = "Save" }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [loadingSites, setLoadingSites] = useState(true)
  
  // Extract roleId from initialData - could be from roleId, role.id, or role (if it's an object)
  const getInitialRoleId = (): number | undefined => {
    if (initialData?.roleId) return initialData.roleId
    if (typeof initialData?.role === 'object' && initialData.role?.id) return initialData.role.id
    if (typeof initialData?.role === 'number') return initialData.role
    return undefined
  }

  // Extract siteIds from initialData - could be from siteIds, sites (array of objects), or assignedStores
  const getInitialSiteIds = (): number[] => {
    if (initialData?.siteIds && Array.isArray(initialData.siteIds)) {
      return initialData.siteIds.map(id => typeof id === 'number' ? id : parseInt(String(id), 10)).filter(id => !isNaN(id))
    }
    if (initialData?.sites && Array.isArray(initialData.sites)) {
      return initialData.sites.map(site => {
        if (typeof site === 'object' && 'id' in site) {
          return typeof site.id === 'number' ? site.id : parseInt(String(site.id), 10)
        }
        return typeof site === 'number' ? site : parseInt(String(site), 10)
      }).filter(id => !isNaN(id))
    }
    if (initialData?.assignedStores && Array.isArray(initialData.assignedStores)) {
      return initialData.assignedStores.map(id => typeof id === 'number' ? id : parseInt(String(id), 10)).filter(id => !isNaN(id))
    }
    return []
  }
  
  const initialFormData = {
    name: initialData?.fullname || "",
    email: initialData?.email || "",
    password: "",
    roleId: getInitialRoleId(),
    siteIds: getInitialSiteIds(),
  }
  
  // Fetch roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true)
        const response: any = await rolesApi.getRoles()
        // Backend returns array directly or wrapped in docs
        const rolesData = Array.isArray(response) ? response : (response?.docs || response?.data || [])
        setRoles(rolesData)
      } catch (error) {
        console.error("Failed to fetch roles:", error)
      } finally {
        setLoadingRoles(false)
      }
    }
    fetchRoles()
  }, [])

  // Fetch sites from backend
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoadingSites(true)
        const response: any = await sitesApi.getSites()
        // Backend returns array directly or wrapped in docs
        const sitesData = Array.isArray(response) ? response : (response?.docs || response?.data || [])
        setSites(sitesData)
      } catch (error) {
        console.error("Failed to fetch sites:", error)
      } finally {
        setLoadingSites(false)
      }
    }
    fetchSites()
  }, [])

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    roleId: {
      required: false, // Make optional for now
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
        password: data.password || undefined,
        roleId: data.roleId ? Number(data.roleId) : undefined,
        siteIds: formState.data.siteIds || [],
      })
      
      formState.setSuccess("User saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save user")
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
              label="Full Name"
              value={formState.data.name || ""}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
            />
            <FormInput
              name="email"
              label="Email"
              type="email"
              value={formState.data.email || ""}
              onChange={(e) => formState.updateField('email', e.target.value)}
              error={formState.errors.email || undefined}
              required
            />
          </div>

          <FormSelect
            name="roleId"
            label="Role"
            value={formState.data.roleId?.toString() || ""}
            onChange={(value) => formState.updateField('roleId', value ? Number(value) : undefined)}
            error={formState.errors.roleId}
            required={false}
            disabled={loadingRoles}
            options={roles.map(role => ({ 
              value: role.id.toString(), 
              label: role.name 
            }))}
            placeholder={loadingRoles ? "Loading roles..." : "Select a role"}
          />
          
          {!initialData && (
            <FormInput
              name="password"
              label="Password"
              type="password"
              value={formState.data.password}
              onChange={(e) => formState.updateField('password', e.target.value)}
              error={formState.errors.password}
              required={!initialData}
            />
          )}

          <FormField
            label="Assign Sites"
            name="siteIds"
            helpText={sites.length === 0 ? "No sites available" : undefined}
          >
            {loadingSites ? (
              <div className="text-sm text-muted-foreground">Loading sites...</div>
            ) : (
              <>
                <input
                  type="hidden"
                  name="siteIds"
                  value={JSON.stringify(formState.data.siteIds || [])}
                />
                <MultiSelect
                  values={formState.data.siteIds?.map(id => id.toString()) || []}
                  onValuesChange={(values) => {
                    formState.updateField('siteIds', values.map(v => parseInt(v, 10)))
                  }}
                >
                  <MultiSelectTrigger className="w-full">
                    <MultiSelectValue placeholder="Select sites..." />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    {sites.map((site) => (
                      <MultiSelectItem
                        key={site.id}
                        value={site.id.toString()}
                        badgeLabel={site.name}
                      >
                        {site.name}
                        {site.city && (
                          <span className="text-muted-foreground ml-2">- {site.city}</span>
                        )}
                      </MultiSelectItem>
                    ))}
                  </MultiSelectContent>
                </MultiSelect>
              </>
            )}
          </FormField>

          <FormActions 
            loading={formState.isLoading}
            submitLabel={submitLabel}
          />
        </Form>
  )
}


