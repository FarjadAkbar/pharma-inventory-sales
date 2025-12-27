"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import type { BOM } from "@/types/manufacturing"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Package, AlertCircle } from "lucide-react"

interface BOMItem {
  materialId: string
  materialName: string
  materialCode: string
  quantityPerBatch: number
  unitOfMeasure: string
  tolerance: number
  isCritical: boolean
  remarks?: string
}

interface BOMFormProps {
  initialData?: Partial<BOM>
  onSubmit: (data: BOM) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function BOMForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: BOMFormProps) {
  const initialFormData = {
    drugId: initialData?.drugId || "",
    drugName: initialData?.drugName || "",
    drugCode: initialData?.drugCode || "",
    version: initialData?.version || 1,
    status: initialData?.status || "Draft",
    batchSize: initialData?.batchSize || "",
    yield: initialData?.yield || "",
    effectiveDate: initialData?.effectiveDate || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || "",
    items: initialData?.items || []
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    drugId: {
      required: true,
      message: "Please select a drug"
    },
    batchSize: {
      required: true,
      message: "Please enter batch size"
    },
    yield: {
      required: true,
      message: "Please enter yield percentage"
    }
  })

  const [items, setItems] = useState<BOMItem[]>(initialFormData.items)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    formState.setLoading(true)
    formState.clearErrors()

    try {
      const errors = validation.validateForm(formState.data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      if (items.length === 0) {
        formState.setError("Please add at least one material item")
        return
      }

      await onSubmit({
        ...formState.data,
        items,
        bomNumber: initialData?.bomNumber || `BOM-${Date.now()}`,
        createdById: "1", // Mock user ID
        createdByName: "Current User", // Mock user name
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as BOM)

      formState.setSuccess("BOM saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save BOM")
    } finally {
      formState.setLoading(false)
    }
  }

  const addItem = () => {
    const newItem: BOMItem = {
      materialId: "",
      materialName: "",
      materialCode: "",
      quantityPerBatch: 0,
      unitOfMeasure: "",
      tolerance: 5,
      isCritical: false,
      remarks: ""
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof BOMItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setItems(updatedItems)
  }

  // Mock data for dropdowns
  const drugs = [
    { value: "1", label: "Paracetamol Tablets - PAR-001" },
    { value: "2", label: "Ibuprofen Tablets - IBU-002" },
    { value: "3", label: "Aspirin Tablets - ASP-003" },
    { value: "4", label: "Amoxicillin Capsules - AMX-004" },
    { value: "5", label: "Cough Syrup - CS-005" }
  ]

  const materials = [
    { value: "1", label: "Paracetamol - PAR-001" },
    { value: "2", label: "Ibuprofen - IBU-002" },
    { value: "3", label: "Aspirin - ASP-003" },
    { value: "4", label: "Lactose - LAC-004" },
    { value: "5", label: "Magnesium Stearate - MS-005" },
    { value: "6", label: "Microcrystalline Cellulose - MCC-006" },
    { value: "7", label: "Starch - ST-007" },
    { value: "8", label: "Talc - TAL-008" }
  ]

  const units = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "g", label: "Gram (g)" },
    { value: "mg", label: "Milligram (mg)" },
    { value: "L", label: "Liter (L)" },
    { value: "ml", label: "Milliliter (ml)" },
    { value: "pcs", label: "Pieces" }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill of Materials Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={handleSubmit}
          loading={formState.isLoading}
          error={formState.error}
          success={formState.success}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="drugId"
              label="Drug"
              value={formState.data.drugId}
              onChange={(e) => {
                const drug = drugs.find(d => d.value === e.target.value)
                formState.updateField('drugId', e.target.value)
                formState.updateField('drugName', drug?.label.split(' - ')[0] || '')
                formState.updateField('drugCode', drug?.label.split(' - ')[1] || '')
              }}
              error={formState.errors.drugId}
              required
              options={drugs}
              placeholder="Select a drug"
            />

            <FormInput
              name="version"
              label="Version"
              type="number"
              value={formState.data.version}
              onChange={(e) => formState.updateField('version', parseInt(e.target.value) || 1)}
              placeholder="1"
              disabled
            />

            <FormInput
              name="batchSize"
              label="Batch Size"
              value={formState.data.batchSize}
              onChange={(e) => formState.updateField('batchSize', e.target.value)}
              error={formState.errors.batchSize}
              required
              placeholder="e.g., 1000 tablets"
            />

            <FormInput
              name="yield"
              label="Yield (%)"
              type="number"
              value={formState.data.yield}
              onChange={(e) => formState.updateField('yield', e.target.value)}
              error={formState.errors.yield}
              required
              placeholder="95"
            />

            <FormInput
              name="effectiveDate"
              label="Effective Date"
              type="date"
              value={formState.data.effectiveDate}
              onChange={(e) => formState.updateField('effectiveDate', e.target.value)}
              placeholder="Select effective date"
            />

            <FormSelect
              name="status"
              label="Status"
              value={formState.data.status}
              onChange={(e) => formState.updateField('status', e.target.value)}
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Under Review", label: "Under Review" },
                { value: "Approved", label: "Approved" },
                { value: "Active", label: "Active" },
                { value: "Obsolete", label: "Obsolete" }
              ]}
              placeholder="Select status"
            />
          </div>

          <FormInput
            name="notes"
            label="Notes"
            value={formState.data.notes}
            onChange={(e) => formState.updateField('notes', e.target.value)}
            placeholder="Additional notes or special instructions"
            multiline
            rows={3}
          />

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Material Requirements</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus  />
                Add Material
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Material {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormSelect
                    name={`materialId_${index}`}
                    label="Material"
                    value={item.materialId}
                    onChange={(e) => {
                      const material = materials.find(m => m.value === e.target.value)
                      updateItem(index, 'materialId', e.target.value)
                      updateItem(index, 'materialName', material?.label.split(' - ')[0] || '')
                      updateItem(index, 'materialCode', material?.label.split(' - ')[1] || '')
                    }}
                    options={materials}
                    placeholder="Select material"
                  />

                  <FormInput
                    name={`quantityPerBatch_${index}`}
                    label="Quantity per Batch"
                    type="number"
                    step="0.001"
                    value={item.quantityPerBatch}
                    onChange={(e) => updateItem(index, 'quantityPerBatch', parseFloat(e.target.value) || 0)}
                    placeholder="0.000"
                    required
                  />

                  <FormSelect
                    name={`unitOfMeasure_${index}`}
                    label="Unit of Measure"
                    value={item.unitOfMeasure}
                    onChange={(e) => updateItem(index, 'unitOfMeasure', e.target.value)}
                    options={units}
                    placeholder="Select unit"
                  />

                  <FormInput
                    name={`tolerance_${index}`}
                    label="Tolerance (%)"
                    type="number"
                    step="0.1"
                    value={item.tolerance}
                    onChange={(e) => updateItem(index, 'tolerance', parseFloat(e.target.value) || 0)}
                    placeholder="5.0"
                  />

                  <FormCheckbox
                    name={`isCritical_${index}`}
                    label="Critical Material"
                    checked={item.isCritical}
                    onChange={(e) => updateItem(index, 'isCritical', e.target.checked)}
                  />

                  <FormInput
                    name={`remarks_${index}`}
                    label="Remarks"
                    value={item.remarks || ''}
                    onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                    placeholder="Special handling instructions"
                  />
                </div>
              </Card>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No materials added yet. Click "Add Material" to get started.</p>
              </div>
            )}

            {items.length > 0 && (
              <Card className="p-4 bg-blue-50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Materials:</span>
                  <div className="flex items-center gap-4">
                    <span className="text-lg">
                      {items.length} materials
                    </span>
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {items.filter(item => item.isCritical).length} critical
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <FormActions
            loading={formState.isLoading}
            submitLabel={submitLabel}
            onCancel={onCancel}
          />
        </Form>
      </CardContent>
    </Card>
  )
}