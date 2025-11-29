"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import type { GoodsReceipt } from "@/types/procurement"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Package } from "lucide-react"

interface GoodsReceiptItem {
  materialId: string
  materialName: string
  materialCode: string
  orderedQuantity: number
  receivedQuantity: number
  unitOfMeasure: string
  batchNumber?: string
  condition?: string
}

interface GoodsReceiptFormProps {
  initialData?: Partial<GoodsReceipt>
  onSubmit: (data: GoodsReceipt) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function GoodsReceiptForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: GoodsReceiptFormProps) {
  const initialFormData = {
    poId: initialData?.poId || "",
    poNumber: initialData?.poNumber || "",
    supplierId: initialData?.supplierId || "",
    supplierName: initialData?.supplierName || "",
    siteId: initialData?.siteId || "",
    siteName: initialData?.siteName || "",
    receivedDate: initialData?.receivedDate || new Date().toISOString().split('T')[0],
    receivedById: initialData?.receivedById || "",
    receivedByName: initialData?.receivedByName || "",
    status: initialData?.status || "Draft",
    qcSampleRequested: initialData?.qcSampleRequested || false,
    coaAttached: initialData?.coaAttached || false,
    notes: initialData?.notes || "",
    items: initialData?.items || []
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    poId: {
      required: true,
      message: "Please select a purchase order"
    },
    supplierId: {
      required: true,
      message: "Please select a supplier"
    },
    siteId: {
      required: true,
      message: "Please select a site"
    },
    receivedDate: {
      required: true,
      message: "Please select a received date"
    },
    receivedById: {
      required: true,
      message: "Please select who received the goods"
    }
  })

  const [items, setItems] = useState<GoodsReceiptItem[]>(initialFormData.items)

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
        formState.setError("Please add at least one item")
        return
      }

      await onSubmit({
        ...formState.data,
        items,
        grnNumber: initialData?.grnNumber || `GRN-${Date.now()}`,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as GoodsReceipt)

      formState.setSuccess("Goods receipt saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save goods receipt")
    } finally {
      formState.setLoading(false)
    }
  }

  const addItem = () => {
    const newItem: GoodsReceiptItem = {
      materialId: "",
      materialName: "",
      materialCode: "",
      orderedQuantity: 0,
      receivedQuantity: 0,
      unitOfMeasure: "",
      batchNumber: "",
      condition: ""
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof GoodsReceiptItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setItems(updatedItems)
  }

  // Mock data for dropdowns
  const purchaseOrders = [
    { value: "1", label: "PO-2024-001 - MediChem Supplies" },
    { value: "2", label: "PO-2024-002 - PharmaExcipients Ltd" },
    { value: "3", label: "PO-2024-003 - Global Pharma Ingredients" }
  ]

  const suppliers = [
    { value: "1", label: "MediChem Supplies" },
    { value: "2", label: "PharmaExcipients Ltd" },
    { value: "3", label: "Global Pharma Ingredients" },
    { value: "4", label: "Chemical Solutions Inc" }
  ]

  const sites = [
    { value: "1", label: "Main Campus" },
    { value: "2", label: "Clifton" },
    { value: "3", label: "North Nazimabad" },
    { value: "4", label: "Korangi" }
  ]

  const users = [
    { value: "1", label: "John Doe" },
    { value: "2", label: "Jane Smith" },
    { value: "3", label: "Mike Johnson" },
    { value: "4", label: "Sarah Wilson" }
  ]

  const materials = [
    { value: "1", label: "Paracetamol - PAR-001" },
    { value: "2", label: "Ibuprofen - IBU-002" },
    { value: "3", label: "Aspirin - ASP-003" },
    { value: "4", label: "Lactose - LAC-004" }
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
        <CardTitle>Goods Receipt Details</CardTitle>
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
              name="poId"
              label="Purchase Order"
              value={formState.data.poId}
              onChange={(e) => {
                const po = purchaseOrders.find(p => p.value === e.target.value)
                formState.updateField('poId', e.target.value)
                formState.updateField('poNumber', po?.label.split(' - ')[0] || '')
              }}
              error={formState.errors.poId}
              required
              options={purchaseOrders}
              placeholder="Select a purchase order"
            />

            <FormSelect
              name="supplierId"
              label="Supplier"
              value={formState.data.supplierId}
              onChange={(e) => {
                const supplier = suppliers.find(s => s.value === e.target.value)
                formState.updateField('supplierId', e.target.value)
                formState.updateField('supplierName', supplier?.label || '')
              }}
              error={formState.errors.supplierId}
              required
              options={suppliers}
              placeholder="Select a supplier"
            />

            <FormSelect
              name="siteId"
              label="Site"
              value={formState.data.siteId}
              onChange={(e) => {
                const site = sites.find(s => s.value === e.target.value)
                formState.updateField('siteId', e.target.value)
                formState.updateField('siteName', site?.label || '')
              }}
              error={formState.errors.siteId}
              required
              options={sites}
              placeholder="Select a site"
            />

            <FormInput
              name="receivedDate"
              label="Received Date"
              type="date"
              value={formState.data.receivedDate}
              onChange={(e) => formState.updateField('receivedDate', e.target.value)}
              error={formState.errors.receivedDate}
              required
            />

            <FormSelect
              name="receivedById"
              label="Received By"
              value={formState.data.receivedById}
              onChange={(e) => {
                const user = users.find(u => u.value === e.target.value)
                formState.updateField('receivedById', e.target.value)
                formState.updateField('receivedByName', user?.label || '')
              }}
              error={formState.errors.receivedById}
              required
              options={users}
              placeholder="Select who received the goods"
            />

            <FormSelect
              name="status"
              label="Status"
              value={formState.data.status}
              onChange={(e) => formState.updateField('status', e.target.value)}
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Pending QC", label: "Pending QC" },
                { value: "QC Approved", label: "QC Approved" },
                { value: "QC Rejected", label: "QC Rejected" },
                { value: "Completed", label: "Completed" },
                { value: "Cancelled", label: "Cancelled" }
              ]}
              placeholder="Select status"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormCheckbox
              name="qcSampleRequested"
              label="QC Sample Requested"
              checked={formState.data.qcSampleRequested}
              onChange={(e) => formState.updateField('qcSampleRequested', e.target.checked)}
            />

            <FormCheckbox
              name="coaAttached"
              label="CoA Attached"
              checked={formState.data.coaAttached}
              onChange={(e) => formState.updateField('coaAttached', e.target.checked)}
            />
          </div>

          <FormInput
            name="notes"
            label="Notes"
            value={formState.data.notes}
            onChange={(e) => formState.updateField('notes', e.target.value)}
            placeholder="Additional notes or comments"
            multiline
            rows={3}
          />

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Received Items</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Item {index + 1}</h4>
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
                    name={`batchNumber_${index}`}
                    label="Batch Number"
                    value={item.batchNumber || ''}
                    onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                    placeholder="Enter batch number"
                  />

                  <FormInput
                    name={`orderedQuantity_${index}`}
                    label="Ordered Quantity"
                    type="number"
                    value={item.orderedQuantity}
                    onChange={(e) => updateItem(index, 'orderedQuantity', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />

                  <FormInput
                    name={`receivedQuantity_${index}`}
                    label="Received Quantity"
                    type="number"
                    value={item.receivedQuantity}
                    onChange={(e) => updateItem(index, 'receivedQuantity', parseFloat(e.target.value) || 0)}
                    placeholder="0"
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
                    name={`condition_${index}`}
                    label="Condition"
                    value={item.condition || ''}
                    onChange={(e) => updateItem(index, 'condition', e.target.value)}
                    placeholder="Good, Damaged, etc."
                  />
                </div>
              </Card>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet. Click "Add Item" to get started.</p>
              </div>
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
