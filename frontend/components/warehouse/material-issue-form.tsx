"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import { warehouseApi, rawMaterialsApi } from "@/services"
import { MEASUREMENT_UNITS } from "@/lib/constants/units"

interface MaterialIssueFormProps {
  initialData?: Partial<MaterialIssue>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

interface MaterialIssue {
  id: number
  issueNumber: string
  materialId: number
  materialName: string
  materialCode: string
  batchNumber?: string
  quantity: number
  unit: string
  fromLocationId?: string
  toLocationId?: string
  workOrderId?: string
  batchId?: string
  referenceId?: string
  referenceType?: string
  remarks?: string
  requestedBy: number
}

export function MaterialIssueForm({ 
  initialData,
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: MaterialIssueFormProps) {
  const [inventoryItems, setInventoryItems] = useState<Array<{ id: number; itemCode: string; materialName: string; materialCode: string; batchNumber: string; quantity: number; unit: string; locationId?: string }>>([])
  const [rawMaterials, setRawMaterials] = useState<Array<{ id: number; name: string; code: string }>>([])
  const [storageLocations, setStorageLocations] = useState<Array<{ id: number; locationCode: string; name: string }>>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [inventoryResponse, rawMaterialsResponse, locationsResponse] = await Promise.all([
        warehouseApi.getInventoryItems({ status: "Available" }),
        rawMaterialsApi.getRawMaterials(),
        warehouseApi.getStorageLocations({ status: "Available" }),
      ])

      if (Array.isArray(inventoryResponse)) {
        setInventoryItems(inventoryResponse.map((item: any) => ({
          id: item.id,
          itemCode: item.itemCode,
          materialName: item.materialName,
          materialCode: item.materialCode,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          unit: item.unit,
          locationId: item.locationId,
        })))
      }

      if (Array.isArray(rawMaterialsResponse)) {
        setRawMaterials(rawMaterialsResponse.map((rm: any) => ({
          id: rm.id,
          name: rm.name,
          code: rm.code,
        })))
      }

      if (Array.isArray(locationsResponse)) {
        setStorageLocations(locationsResponse.map((loc: any) => ({
          id: loc.id,
          locationCode: loc.locationCode,
          name: loc.name,
        })))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const initialFormData = {
    materialId: initialData?.materialId?.toString() || "",
    materialName: initialData?.materialName || "",
    materialCode: initialData?.materialCode || "",
    batchNumber: initialData?.batchNumber || "",
    quantity: initialData?.quantity?.toString() || "",
    unit: initialData?.unit || "",
    fromLocationId: initialData?.fromLocationId || "",
    toLocationId: initialData?.toLocationId || "",
    workOrderId: initialData?.workOrderId || "",
    batchId: initialData?.batchId || "",
    referenceId: initialData?.referenceId || "",
    referenceType: initialData?.referenceType || "",
    remarks: initialData?.remarks || "",
    requestedBy: initialData?.requestedBy?.toString() || "1", // TODO: Get from auth context
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    materialId: {
      required: true,
      message: "Please select a material"
    },
    quantity: {
      required: true,
      message: "Please enter quantity"
    },
    unit: {
      required: true,
      message: "Please select a unit"
    },
  })

  const handleMaterialSelect = (value: string) => {
    if (value.startsWith('inv-')) {
      // Inventory item selected
      const itemId = parseInt(value.replace('inv-', ''))
      const item = inventoryItems.find(i => i.id === itemId)
      if (item) {
        formState.updateField('materialId', item.id.toString())
        formState.updateField('materialName', item.materialName)
        formState.updateField('materialCode', item.materialCode)
        formState.updateField('batchNumber', item.batchNumber)
        formState.updateField('quantity', item.quantity.toString())
        formState.updateField('unit', item.unit)
        formState.updateField('fromLocationId', item.locationId || '')
      }
    } else {
      // Raw material selected
      const materialId = parseInt(value)
      const material = rawMaterials.find(m => m.id === materialId)
      if (material) {
        formState.updateField('materialId', material.id.toString())
        formState.updateField('materialName', material.name)
        formState.updateField('materialCode', material.code)
      }
    }
  }

  const handleSubmit = async () => {
    formState.setLoading(true)
    formState.clearErrors()

    try {
      const errors = validation.validateForm(formState.data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      const issueData: any = {
        materialId: parseInt(formState.data.materialId),
        materialName: formState.data.materialName || undefined,
        materialCode: formState.data.materialCode || undefined,
        batchNumber: formState.data.batchNumber || undefined,
        quantity: parseFloat(formState.data.quantity),
        unit: formState.data.unit,
        fromLocationId: formState.data.fromLocationId || undefined,
        toLocationId: formState.data.toLocationId || undefined,
        workOrderId: formState.data.workOrderId || undefined,
        batchId: formState.data.batchId || undefined,
        referenceId: formState.data.referenceId || undefined,
        referenceType: formState.data.referenceType || undefined,
        remarks: formState.data.remarks || undefined,
        requestedBy: parseInt(formState.data.requestedBy),
      }

      await onSubmit(issueData)
      formState.setSuccess("Material issue created successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to create material issue")
    } finally {
      formState.setLoading(false)
    }
  }

  const materialOptions = [
    ...inventoryItems.map(item => ({
      value: `inv-${item.id}`,
      label: `${item.itemCode} - ${item.materialName} (Batch: ${item.batchNumber}, Qty: ${item.quantity} ${item.unit})`
    })),
    ...rawMaterials.map(rm => ({
      value: rm.id.toString(),
      label: `${rm.code} - ${rm.name}`
    }))
  ]

  const locationOptions = storageLocations.map(loc => ({
    value: loc.locationCode,
    label: `${loc.locationCode} - ${loc.name}`
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material Issue Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={handleSubmit}
          loading={formState.isLoading}
          error={formState.error || undefined}
          success={formState.success || undefined}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="material"
              label="Material *"
              value={formState.data.materialId ? (inventoryItems.find(i => i.id.toString() === formState.data.materialId) ? `inv-${formState.data.materialId}` : formState.data.materialId) : ""}
              onChange={handleMaterialSelect}
              error={formState.errors.materialId}
              required
              options={materialOptions}
              placeholder="Select material or inventory item"
            />

            <FormInput
              name="materialName"
              label="Material Name"
              value={formState.data.materialName}
              onChange={(e) => formState.updateField('materialName', e.target.value)}
              disabled
              placeholder="Auto-filled from selection"
            />

            <FormInput
              name="materialCode"
              label="Material Code"
              value={formState.data.materialCode}
              onChange={(e) => formState.updateField('materialCode', e.target.value)}
              disabled
              placeholder="Auto-filled from selection"
            />

            <FormInput
              name="batchNumber"
              label="Batch Number"
              value={formState.data.batchNumber}
              onChange={(e) => formState.updateField('batchNumber', e.target.value)}
              placeholder="Enter batch number"
            />

            <FormInput
              name="quantity"
              label="Quantity *"
              value={formState.data.quantity}
              onChange={(e) => formState.updateField('quantity', e.target.value)}
              error={formState.errors.quantity}
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter quantity"
            />

            <FormSelect
              name="unit"
              label="Unit *"
              value={formState.data.unit}
              onChange={(value) => formState.updateField('unit', value)}
              error={formState.errors.unit}
              required
              options={MEASUREMENT_UNITS}
              placeholder="Select unit"
            />

            <FormSelect
              name="fromLocationId"
              label="From Location"
              value={formState.data.fromLocationId}
              onChange={(value) => formState.updateField('fromLocationId', value)}
              options={locationOptions}
              placeholder="Select source location"
            />

            <FormInput
              name="workOrderId"
              label="Work Order ID"
              value={formState.data.workOrderId}
              onChange={(e) => formState.updateField('workOrderId', e.target.value)}
              placeholder="Enter work order ID"
            />

            <FormInput
              name="batchId"
              label="Batch ID"
              value={formState.data.batchId}
              onChange={(e) => formState.updateField('batchId', e.target.value)}
              placeholder="Enter batch ID"
            />

            <FormInput
              name="referenceType"
              label="Reference Type"
              value={formState.data.referenceType}
              onChange={(e) => formState.updateField('referenceType', e.target.value)}
              placeholder="e.g., Production Order"
            />

            <FormInput
              name="referenceId"
              label="Reference ID"
              value={formState.data.referenceId}
              onChange={(e) => formState.updateField('referenceId', e.target.value)}
              placeholder="Enter reference ID"
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

