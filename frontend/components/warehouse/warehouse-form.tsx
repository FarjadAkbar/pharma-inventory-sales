"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import type { Warehouse } from "@/types/warehouse"
import { sitesApi, type Site } from "@/services"

interface WarehouseFormProps {
  initialData?: Partial<Warehouse>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function WarehouseForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: WarehouseFormProps) {
  const [sites, setSites] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const sitesData = await sitesApi.getSites()
      if (Array.isArray(sitesData)) {
        setSites(sitesData.map((site: Site) => ({ id: site.id, name: site.name })))
      }
    } catch (error) {
      console.error("Failed to fetch sites:", error)
    }
  }

  const initialFormData = {
    code: initialData?.code || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "Main",
    status: initialData?.status || "Active",
    siteId: initialData?.siteId?.toString() || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "",
    postalCode: initialData?.postalCode || "",
    minTemperature: initialData?.minTemperature?.toString() || "",
    maxTemperature: initialData?.maxTemperature?.toString() || "",
    minHumidity: initialData?.minHumidity?.toString() || "",
    maxHumidity: initialData?.maxHumidity?.toString() || "",
    managerId: initialData?.managerId?.toString() || "",
    remarks: initialData?.remarks || "",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    code: {
      required: true,
      message: "Please enter a warehouse code"
    },
    name: {
      required: true,
      message: "Please enter a warehouse name"
    }
  })

  const handleSubmit = async () => {
    formState.setLoading(true)
    formState.clearErrors()

    try {
      const errors = validation.validateForm(formState.data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      const warehouseData: any = {
        code: formState.data.code,
        name: formState.data.name,
        description: formState.data.description || undefined,
        type: formState.data.type,
        status: formState.data.status,
        siteId: formState.data.siteId ? parseInt(formState.data.siteId) : undefined,
        address: formState.data.address || undefined,
        city: formState.data.city || undefined,
        state: formState.data.state || undefined,
        country: formState.data.country || undefined,
        postalCode: formState.data.postalCode || undefined,
        minTemperature: formState.data.minTemperature ? parseFloat(formState.data.minTemperature) : undefined,
        maxTemperature: formState.data.maxTemperature ? parseFloat(formState.data.maxTemperature) : undefined,
        minHumidity: formState.data.minHumidity ? parseFloat(formState.data.minHumidity) : undefined,
        maxHumidity: formState.data.maxHumidity ? parseFloat(formState.data.maxHumidity) : undefined,
        managerId: formState.data.managerId ? parseInt(formState.data.managerId) : undefined,
        remarks: formState.data.remarks || undefined,
      }

      await onSubmit(warehouseData)
      formState.setSuccess("Warehouse saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save warehouse")
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={handleSubmit}
          loading={formState.isLoading}
          error={formState.error || undefined}
          success={formState.success || undefined}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              name="code"
              label="Warehouse Code *"
              value={formState.data.code}
              onChange={(e) => formState.updateField('code', e.target.value)}
              error={formState.errors.code}
              required
              placeholder="e.g., WH-001"
            />

            <FormInput
              name="name"
              label="Warehouse Name *"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
              placeholder="e.g., Main Warehouse"
            />

            <FormSelect
              name="type"
              label="Type"
              value={formState.data.type}
              onChange={(value) => formState.updateField('type', value)}
              options={[
                { value: "Main", label: "Main" },
                { value: "Distribution", label: "Distribution" },
                { value: "Cold Storage", label: "Cold Storage" },
                { value: "Quarantine", label: "Quarantine" },
                { value: "Hold", label: "Hold" },
              ]}
              placeholder="Select warehouse type"
            />

            <FormSelect
              name="status"
              label="Status"
              value={formState.data.status}
              onChange={(value) => formState.updateField('status', value)}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Maintenance", label: "Maintenance" },
              ]}
              placeholder="Select status"
            />

            <FormSelect
              name="siteId"
              label="Site"
              value={formState.data.siteId}
              onChange={(value) => formState.updateField('siteId', value)}
              options={[
                { value: "", label: "None (Optional)" },
                ...sites.map(site => ({ value: site.id.toString(), label: site.name }))
              ]}
              placeholder="Select site (optional)"
            />

            <FormInput
              name="managerId"
              label="Manager ID"
              value={formState.data.managerId}
              onChange={(e) => formState.updateField('managerId', e.target.value)}
              type="number"
              placeholder="Enter manager ID"
            />

            <FormInput
              name="address"
              label="Address"
              value={formState.data.address}
              onChange={(e) => formState.updateField('address', e.target.value)}
              placeholder="Enter address"
            />

            <FormInput
              name="city"
              label="City"
              value={formState.data.city}
              onChange={(e) => formState.updateField('city', e.target.value)}
              placeholder="Enter city"
            />

            <FormInput
              name="state"
              label="State/Province"
              value={formState.data.state}
              onChange={(e) => formState.updateField('state', e.target.value)}
              placeholder="Enter state or province"
            />

            <FormInput
              name="country"
              label="Country"
              value={formState.data.country}
              onChange={(e) => formState.updateField('country', e.target.value)}
              placeholder="Enter country"
            />

            <FormInput
              name="postalCode"
              label="Postal Code"
              value={formState.data.postalCode}
              onChange={(e) => formState.updateField('postalCode', e.target.value)}
              placeholder="Enter postal code"
            />

            <FormInput
              name="minTemperature"
              label="Min Temperature (°C)"
              value={formState.data.minTemperature}
              onChange={(e) => formState.updateField('minTemperature', e.target.value)}
              type="number"
              step="0.1"
              placeholder="e.g., 2"
            />

            <FormInput
              name="maxTemperature"
              label="Max Temperature (°C)"
              value={formState.data.maxTemperature}
              onChange={(e) => formState.updateField('maxTemperature', e.target.value)}
              type="number"
              step="0.1"
              placeholder="e.g., 8"
            />

            <FormInput
              name="minHumidity"
              label="Min Humidity (%)"
              value={formState.data.minHumidity}
              onChange={(e) => formState.updateField('minHumidity', e.target.value)}
              type="number"
              step="0.1"
              placeholder="e.g., 30"
            />

            <FormInput
              name="maxHumidity"
              label="Max Humidity (%)"
              value={formState.data.maxHumidity}
              onChange={(e) => formState.updateField('maxHumidity', e.target.value)}
              type="number"
              step="0.1"
              placeholder="e.g., 70"
            />
          </div>

          <FormTextarea
            name="description"
            label="Description"
            value={formState.data.description}
            onChange={(e) => formState.updateField('description', e.target.value)}
            placeholder="Warehouse description"
            rows={3}
          />

          <FormTextarea
            name="remarks"
            label="Remarks"
            value={formState.data.remarks}
            onChange={(e) => formState.updateField('remarks', e.target.value)}
            placeholder="Additional notes or comments"
            rows={3}
          />

          <FormActions
            onSubmit={handleSubmit}
            onCancel={onCancel}
            submitLabel={submitLabel}
            loading={formState.isLoading}
          />
        </Form>
      </CardContent>
    </Card>
  )
}

