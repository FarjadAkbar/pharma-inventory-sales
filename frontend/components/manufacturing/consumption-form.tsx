"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormInput, FormSelect, FormActions } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { manufacturingApi, rawMaterialsApi, warehouseApi } from "@/services"

interface ConsumptionFormProps {
  initialData?: any
  onSubmit: (data: any) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
}

export function ConsumptionForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Save Consumption",
}: ConsumptionFormProps) {
  const [batches, setBatches] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [formData, setFormData] = useState({
    batchId: initialData?.batchId?.toString() || "",
    materialId: initialData?.materialId?.toString() || "",
    materialName: initialData?.materialName || "",
    materialCode: initialData?.materialCode || "",
    batchNumber: initialData?.batchNumber || "",
    plannedQuantity: initialData?.plannedQuantity?.toString() || "",
    actualQuantity: initialData?.actualQuantity?.toString() || "",
    unit: initialData?.unit || "",
    locationId: initialData?.locationId?.toString() || "",
    status: initialData?.status || "Consumed",
    remarks: initialData?.remarks || "",
  })

  useEffect(() => {
    // Fetch batches, materials, and locations
    Promise.all([
      manufacturingApi.getBatches().catch(() => ({ data: { batches: [] } })),
      rawMaterialsApi.getRawMaterials().catch(() => []),
      warehouseApi.getStorageLocations().catch(() => ({ data: [] })),
    ]).then(([batchesRes, materialsRes, locationsRes]) => {
      if (batchesRes?.data?.batches) {
        setBatches(Array.isArray(batchesRes.data.batches) ? batchesRes.data.batches : [])
      } else if (Array.isArray(batchesRes)) {
        setBatches(batchesRes)
      }
      if (Array.isArray(materialsRes)) {
        setMaterials(materialsRes)
      }
      if (locationsRes?.data) {
        setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : [])
      } else if (Array.isArray(locationsRes)) {
        setLocations(locationsRes)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      batchId: formData.batchId,
      materialId: parseInt(formData.materialId),
      materialName: formData.materialName,
      materialCode: formData.materialCode,
      batchNumber: formData.batchNumber,
      plannedQuantity: parseFloat(formData.plannedQuantity),
      actualQuantity: parseFloat(formData.actualQuantity),
      unit: formData.unit,
      locationId: formData.locationId ? parseInt(formData.locationId) : undefined,
      status: formData.status,
      remarks: formData.remarks || undefined,
      consumedBy: 1, // TODO: Get from auth context
    }

    await onSubmit(submitData)
  }

  const handleBatchChange = (batchId: string) => {
    const batch = batches.find(b => b.id.toString() === batchId)
    if (batch) {
      setFormData(prev => ({
        ...prev,
        batchId: batch.id.toString(),
        batchNumber: batch.batchNumber,
      }))
    }
  }

  const handleMaterialChange = (materialId: string) => {
    const material = materials.find(m => m.id.toString() === materialId)
    if (material) {
      setFormData(prev => ({
        ...prev,
        materialId: material.id.toString(),
        materialName: material.name,
        materialCode: material.code,
        unit: material.unit || prev.unit,
      }))
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FormSelect
            name="batchId"
            label="Batch"
            value={formData.batchId || undefined}
            onChange={handleBatchChange}
            options={batches.map((batch) => ({
              value: batch.id.toString(),
              label: `${batch.batchNumber} - ${batch.drugName}`,
            }))}
            placeholder="Select Batch"
            required
          />
        </div>

        <div className="space-y-2">
          <FormSelect
            name="materialId"
            label="Material"
            value={formData.materialId || undefined}
            onChange={handleMaterialChange}
            options={materials.map((material) => ({
              value: material.id.toString(),
              label: `${material.name} (${material.code})`,
            }))}
            placeholder="Select Material"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchNumber">Material Batch Number *</Label>
          <FormInput
            id="batchNumber"
            value={formData.batchNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plannedQuantity">Planned Quantity *</Label>
          <FormInput
            id="plannedQuantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.plannedQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, plannedQuantity: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actualQuantity">Actual Quantity *</Label>
          <FormInput
            id="actualQuantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.actualQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, actualQuantity: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <FormInput
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <FormSelect
            name="locationId"
            label="Location"
            value={formData.locationId || undefined}
            onChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
            options={locations.map((location) => ({
              value: location.id.toString(),
              label: `${location.name} (${location.code})`,
            }))}
            placeholder="Select Location"
          />
        </div>

        <div className="space-y-2">
          <FormSelect
            name="status"
            label="Status"
            value={formData.status}
            onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            options={[
              { value: "Pending", label: "Pending" },
              { value: "Consumed", label: "Consumed" },
              { value: "Rejected", label: "Rejected" },
            ]}
            placeholder="Select Status"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      <FormActions>
        <Button type="submit" disabled={loading}>
          {submitLabel}
        </Button>
      </FormActions>
    </Form>
  )
}

