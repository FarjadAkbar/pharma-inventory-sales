"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormInput, FormSelect, FormCheckbox, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import type { StorageLocation } from "@/types/warehouse"
import { warehouseApi } from "@/services"
import { useEffect } from "react"

interface StorageLocationFormProps {
  initialData?: Partial<StorageLocation>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function StorageLocationForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: StorageLocationFormProps) {
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseApi.getWarehouses()
      if (Array.isArray(response)) {
        setWarehouses(response.map(w => ({ id: w.id, name: w.name })))
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error)
    }
  }

  const initialFormData = {
    locationCode: initialData?.locationCode || "",
    warehouseId: initialData?.warehouseId?.toString() || "",
    name: initialData?.name || "",
    type: initialData?.type || "Bin",
    status: initialData?.status || "Available",
    zone: initialData?.zone || "",
    aisle: initialData?.aisle || "",
    rack: initialData?.rack || "",
    shelf: initialData?.shelf || "",
    position: initialData?.position || "",
    capacity: initialData?.capacity?.toString() || "",
    capacityUnit: initialData?.capacityUnit || "",
    minTemperature: initialData?.minTemperature?.toString() || "",
    maxTemperature: initialData?.maxTemperature?.toString() || "",
    minHumidity: initialData?.minHumidity?.toString() || "",
    maxHumidity: initialData?.maxHumidity?.toString() || "",
    requiresTemperatureControl: initialData?.requiresTemperatureControl || false,
    requiresHumidityControl: initialData?.requiresHumidityControl || false,
    remarks: initialData?.remarks || "",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    locationCode: {
      required: true,
      message: "Please enter a location code"
    },
    name: {
      required: true,
      message: "Please enter a location name"
    },
    warehouseId: {
      required: true,
      message: "Please select a warehouse"
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

      const locationData: any = {
        locationCode: formState.data.locationCode,
        warehouseId: parseInt(formState.data.warehouseId),
        name: formState.data.name,
        type: formState.data.type,
        status: formState.data.status,
        zone: formState.data.zone || undefined,
        aisle: formState.data.aisle || undefined,
        rack: formState.data.rack || undefined,
        shelf: formState.data.shelf || undefined,
        position: formState.data.position || undefined,
        capacity: formState.data.capacity ? parseFloat(formState.data.capacity) : undefined,
        capacityUnit: formState.data.capacityUnit || undefined,
        minTemperature: formState.data.minTemperature ? parseFloat(formState.data.minTemperature) : undefined,
        maxTemperature: formState.data.maxTemperature ? parseFloat(formState.data.maxTemperature) : undefined,
        minHumidity: formState.data.minHumidity ? parseFloat(formState.data.minHumidity) : undefined,
        maxHumidity: formState.data.maxHumidity ? parseFloat(formState.data.maxHumidity) : undefined,
        requiresTemperatureControl: formState.data.requiresTemperatureControl,
        requiresHumidityControl: formState.data.requiresHumidityControl,
        remarks: formState.data.remarks || undefined,
      }

      await onSubmit(locationData)
      formState.setSuccess("Storage location saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save storage location")
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Location Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={async (e) => {
            e.preventDefault()
            await handleSubmit()
          }}
          loading={formState.isLoading}
          error={formState.error || undefined}
          success={formState.success || undefined}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              name="locationCode"
              label="Location Code *"
              value={formState.data.locationCode}
              onChange={(e) => formState.updateField('locationCode', e.target.value)}
              error={formState.errors.locationCode}
              required
              placeholder="e.g., LOC-001"
            />

            <FormSelect
              name="warehouseId"
              label="Warehouse *"
              value={formState.data.warehouseId}
              onChange={(value) => formState.updateField('warehouseId', value)}
              error={formState.errors.warehouseId}
              required
              options={warehouses.map(w => ({ value: w.id.toString(), label: w.name }))}
              placeholder="Select warehouse"
            />

            <FormInput
              name="name"
              label="Location Name *"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
              placeholder="e.g., Zone A - Rack 1"
            />

            <FormSelect
              name="type"
              label="Type"
              value={formState.data.type}
              onChange={(value) => formState.updateField('type', value)}
              options={[
                { value: "Bin", label: "Bin" },
                { value: "Rack", label: "Rack" },
                { value: "Shelf", label: "Shelf" },
                { value: "Pallet", label: "Pallet" },
                { value: "Bulk", label: "Bulk" },
                { value: "Cold Room", label: "Cold Room" },
                { value: "Freezer", label: "Freezer" },
              ]}
              placeholder="Select location type"
            />

            <FormSelect
              name="status"
              label="Status"
              value={formState.data.status}
              onChange={(value) => formState.updateField('status', value)}
              options={[
                { value: "Available", label: "Available" },
                { value: "Occupied", label: "Occupied" },
                { value: "Reserved", label: "Reserved" },
                { value: "Blocked", label: "Blocked" },
                { value: "Maintenance", label: "Maintenance" },
              ]}
              placeholder="Select status"
            />

            <FormInput
              name="zone"
              label="Zone"
              value={formState.data.zone}
              onChange={(e) => formState.updateField('zone', e.target.value)}
              placeholder="e.g., Zone A"
            />

            <FormInput
              name="aisle"
              label="Aisle"
              value={formState.data.aisle}
              onChange={(e) => formState.updateField('aisle', e.target.value)}
              placeholder="e.g., Aisle 1"
            />

            <FormInput
              name="rack"
              label="Rack"
              value={formState.data.rack}
              onChange={(e) => formState.updateField('rack', e.target.value)}
              placeholder="e.g., Rack 1"
            />

            <FormInput
              name="shelf"
              label="Shelf"
              value={formState.data.shelf}
              onChange={(e) => formState.updateField('shelf', e.target.value)}
              placeholder="e.g., Shelf 1"
            />

            <FormInput
              name="position"
              label="Position"
              value={formState.data.position}
              onChange={(e) => formState.updateField('position', e.target.value)}
              placeholder="e.g., Position 1"
            />

            <FormInput
              name="capacity"
              label="Capacity"
              value={formState.data.capacity}
              onChange={(e) => formState.updateField('capacity', e.target.value)}
              type="number"
              step="0.01"
              placeholder="e.g., 100"
            />

            <FormInput
              name="capacityUnit"
              label="Capacity Unit"
              value={formState.data.capacityUnit}
              onChange={(e) => formState.updateField('capacityUnit', e.target.value)}
              placeholder="e.g., kg, L, m³"
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

          <div className="grid md:grid-cols-2 gap-4">
            <FormCheckbox
              name="requiresTemperatureControl"
              label="Requires Temperature Control"
              checked={formState.data.requiresTemperatureControl}
              onChange={(e) => formState.updateField('requiresTemperatureControl', e.target.checked)}
            />

            <FormCheckbox
              name="requiresHumidityControl"
              label="Requires Humidity Control"
              checked={formState.data.requiresHumidityControl}
              onChange={(e) => formState.updateField('requiresHumidityControl', e.target.checked)}
            />
          </div>

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

