"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormInput, FormSelect, FormActions } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { rawMaterialsApi, warehouseApi, manufacturingApi } from "@/services"
import { toast } from "sonner"

interface MaterialConsumptionFormProps {
  batchId: string
  onSuccess?: () => void
}

export function MaterialConsumptionForm({ batchId, onSuccess }: MaterialConsumptionFormProps) {
  const [rawMaterials, setRawMaterials] = useState<any[]>([])
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    materialId: "",
    materialName: "",
    materialCode: "",
    batchNumber: "",
    plannedQuantity: "",
    actualQuantity: "",
    unit: "",
    locationId: "",
    remarks: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [materialsRes, inventoryRes] = await Promise.all([
        rawMaterialsApi.getRawMaterials().catch(() => ({ data: [] })),
        warehouseApi.getInventoryItems({ status: "Available" }).catch(() => ({ data: [] })),
      ])
      // Handle different response formats
      if (materialsRes?.data) {
        setRawMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : [])
      } else if (Array.isArray(materialsRes)) {
        setRawMaterials(materialsRes)
      }
      if (inventoryRes?.data) {
        setInventoryItems(Array.isArray(inventoryRes.data) ? inventoryRes.data : [])
      } else if (Array.isArray(inventoryRes)) {
        setInventoryItems(inventoryRes)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const handleMaterialChange = (materialId: string) => {
    const material = rawMaterials.find(m => m.id.toString() === materialId)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await manufacturingApi.consumeMaterial(batchId, {
        ...formData,
        materialId: parseInt(formData.materialId),
        plannedQuantity: parseFloat(formData.plannedQuantity),
        actualQuantity: parseFloat(formData.actualQuantity),
        locationId: formData.locationId ? parseInt(formData.locationId) : undefined,
        consumedBy: 1, // TODO: Get from auth context
      })

      if (response.success) {
        toast.success("Material consumption recorded")
        onSuccess?.()
        setFormData({
          materialId: "",
          materialName: "",
          materialCode: "",
          batchNumber: "",
          plannedQuantity: "",
          actualQuantity: "",
          unit: "",
          locationId: "",
          remarks: "",
        })
      } else {
        toast.error(response.message || "Failed to record consumption")
      }
    } catch (error) {
      console.error("Error recording consumption:", error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="materialId">Material *</Label>
          <FormSelect
            id="materialId"
            value={formData.materialId}
            onValueChange={handleMaterialChange}
            required
          >
            <option value="">Select Material</option>
            {rawMaterials.map((material) => (
              <option key={material.id} value={material.id.toString()}>
                {material.name} ({material.code})
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="unit">Unit *</Label>
            <FormInput
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            rows={3}
          />
        </div>

        <FormActions>
          <Button type="submit" disabled={loading}>
            Record Consumption
          </Button>
        </FormActions>
      </div>
    </Form>
  )
}

