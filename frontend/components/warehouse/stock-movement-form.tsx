"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import { warehouseApi, rawMaterialsApi } from "@/services"
import { MEASUREMENT_UNITS } from "@/lib/constants/units"

interface StockMovementFormProps {
  initialData?: Partial<StockMovement>
  fromItemId?: number
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

interface StockMovement {
  id: number
  movementNumber: string
  movementType: string
  materialId: number
  materialName: string
  materialCode: string
  batchNumber: string
  quantity: number
  unit: string
  fromLocationId?: string
  toLocationId?: string
  referenceId?: string
  referenceType?: string
  remarks?: string
  performedBy?: number
  performedAt?: string
}

export function StockMovementForm({ 
  initialData,
  fromItemId,
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: StockMovementFormProps) {
  const [inventoryItems, setInventoryItems] = useState<Array<{ id: number; itemCode: string; materialName: string; materialCode: string; batchNumber: string; quantity: number; unit: string; locationId?: string }>>([])
  const [rawMaterials, setRawMaterials] = useState<Array<{ id: number; name: string; code: string }>>([])
  const [storageLocations, setStorageLocations] = useState<Array<{ id: number; locationCode: string; name: string }>>([])
  const [selectedMaterial, setSelectedMaterial] = useState<{ id: number; name: string; code: string } | null>(null)

  useEffect(() => {
    fetchData()
    if (fromItemId) {
      fetchInventoryItem(fromItemId)
    }
  }, [fromItemId])

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

  const fetchInventoryItem = async (itemId: number) => {
    try {
      const item = await warehouseApi.getInventoryItem(itemId.toString())
      if (item) {
        formState.updateField('materialId', item.materialId.toString())
        formState.updateField('materialName', item.materialName)
        formState.updateField('materialCode', item.materialCode)
        formState.updateField('batchNumber', item.batchNumber)
        formState.updateField('quantity', item.quantity.toString())
        formState.updateField('unit', item.unit)
        formState.updateField('fromLocationId', item.locationId || '')
      }
    } catch (error) {
      console.error("Failed to fetch inventory item:", error)
    }
  }

  const initialFormData = {
    movementType: initialData?.movementType || "Transfer",
    materialId: initialData?.materialId?.toString() || "",
    materialName: initialData?.materialName || "",
    materialCode: initialData?.materialCode || "",
    batchNumber: initialData?.batchNumber || "",
    quantity: initialData?.quantity?.toString() || "",
    unit: initialData?.unit || "",
    fromLocationId: initialData?.fromLocationId || "",
    toLocationId: initialData?.toLocationId || "",
    referenceId: initialData?.referenceId || "",
    referenceType: initialData?.referenceType || "",
    remarks: initialData?.remarks || "",
    performedBy: initialData?.performedBy?.toString() || "1", // TODO: Get from auth context
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    movementType: {
      required: true,
      message: "Please select a movement type"
    },
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
        setSelectedMaterial({ id: item.id, name: item.materialName, code: item.materialCode })
      }
    } else {
      // Raw material selected
      const materialId = parseInt(value)
      const material = rawMaterials.find(m => m.id === materialId)
      if (material) {
        formState.updateField('materialId', material.id.toString())
        formState.updateField('materialName', material.name)
        formState.updateField('materialCode', material.code)
        setSelectedMaterial({ id: material.id, name: material.name, code: material.code })
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

      // Validate movement type specific requirements
      if (formState.data.movementType === "Transfer" && !formState.data.fromLocationId && !formState.data.toLocationId) {
        formState.setError("Transfer movements require both from and to locations")
        return
      }

      if (formState.data.movementType === "Receipt" && !formState.data.toLocationId) {
        formState.setError("Receipt movements require a destination location")
        return
      }

      if (formState.data.movementType === "Consumption" && !formState.data.fromLocationId) {
        formState.setError("Consumption movements require a source location")
        return
      }

      const movementData: any = {
        movementType: formState.data.movementType,
        materialId: parseInt(formState.data.materialId),
        materialName: formState.data.materialName || undefined,
        materialCode: formState.data.materialCode || undefined,
        batchNumber: formState.data.batchNumber || undefined,
        quantity: parseFloat(formState.data.quantity),
        unit: formState.data.unit,
        fromLocationId: formState.data.fromLocationId || undefined,
        toLocationId: formState.data.toLocationId || undefined,
        referenceId: formState.data.referenceId || undefined,
        referenceType: formState.data.referenceType || undefined,
        remarks: formState.data.remarks || undefined,
        performedBy: parseInt(formState.data.performedBy),
      }

      await onSubmit(movementData)
      formState.setSuccess("Stock movement saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save stock movement")
    } finally {
      formState.setLoading(false)
    }
  }

  const movementTypeOptions = [
    { value: "Receipt", label: "Receipt" },
    { value: "Transfer", label: "Transfer" },
    { value: "Consumption", label: "Consumption" },
    { value: "Shipment", label: "Shipment" },
    { value: "Adjustment", label: "Adjustment" },
    { value: "Issue", label: "Issue" },
    { value: "Return", label: "Return" },
  ]

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

  const requiresFromLocation = ["Transfer", "Consumption", "Shipment", "Issue", "Return"].includes(formState.data.movementType)
  const requiresToLocation = ["Receipt", "Transfer", "Return"].includes(formState.data.movementType)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Movement Details</CardTitle>
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
              name="movementType"
              label="Movement Type *"
              value={formState.data.movementType}
              onChange={(value) => formState.updateField('movementType', value)}
              error={formState.errors.movementType}
              required
              options={movementTypeOptions}
              placeholder="Select movement type"
            />

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

            {requiresFromLocation && (
              <FormSelect
                name="fromLocationId"
                label="From Location"
                value={formState.data.fromLocationId}
                onChange={(value) => formState.updateField('fromLocationId', value)}
                options={locationOptions}
                placeholder="Select source location"
              />
            )}

            {requiresToLocation && (
              <FormSelect
                name="toLocationId"
                label="To Location"
                value={formState.data.toLocationId}
                onChange={(value) => formState.updateField('toLocationId', value)}
                options={locationOptions}
                placeholder="Select destination location"
              />
            )}

            <FormInput
              name="referenceType"
              label="Reference Type"
              value={formState.data.referenceType}
              onChange={(e) => formState.updateField('referenceType', e.target.value)}
              placeholder="e.g., Purchase Order, Work Order"
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

