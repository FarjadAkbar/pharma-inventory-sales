"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import type { PurchaseOrder } from "@/types/procurement"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Package } from "lucide-react"

interface POItem {
  materialId: string
  materialName: string
  materialCode: string
  quantity: number
  unitId: string
  unitOfMeasure: string
  unitPrice: number
  totalPrice: number
}

interface PurchaseOrderFormProps {
  initialData?: Partial<PurchaseOrder>
  onSubmit: (data: PurchaseOrder) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function PurchaseOrderForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: PurchaseOrderFormProps) {
  const initialFormData = {
    supplierId: initialData?.supplierId || "",
    supplierName: initialData?.supplierName || "",
    siteId: initialData?.siteId || "",
    siteName: initialData?.siteName || "",
    expectedDate: initialData?.expectedDate || new Date().toISOString().split('T')[0],
    status: initialData?.status || "Draft",
    currency: initialData?.currency || "PKR",
    notes: initialData?.notes || "",
    items: initialData?.items || []
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    supplierId: {
      required: true,
      message: "Please select a supplier"
    },
    siteId: {
      required: true,
      message: "Please select a site"
    },
    expectedDate: {
      required: true,
      message: "Please select an expected date"
    }
  })

  const [items, setItems] = useState<POItem[]>(initialFormData.items)

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

      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

      await onSubmit({
        ...formState.data,
        items,
        totalAmount,
        poNumber: initialData?.poNumber || `PO-${Date.now()}`,
        createdById: "1", // Mock user ID
        createdByName: "Current User", // Mock user name
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as PurchaseOrder)

      formState.setSuccess("Purchase order saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save purchase order")
    } finally {
      formState.setLoading(false)
    }
  }

  const addItem = () => {
    const newItem: POItem = {
      materialId: "",
      materialName: "",
      materialCode: "",
      quantity: 0,
      unitId: "",
      unitOfMeasure: "",
      unitPrice: 0,
      totalPrice: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof POItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Calculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice
    }
    
    setItems(updatedItems)
  }

  // Mock data for dropdowns
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

  const materials = [
    { value: "1", label: "Paracetamol - PAR-001" },
    { value: "2", label: "Ibuprofen - IBU-002" },
    { value: "3", label: "Aspirin - ASP-003" },
    { value: "4", label: "Lactose - LAC-004" },
    { value: "5", label: "Magnesium Stearate - MS-005" }
  ]

  const units = [
    { value: "1", label: "Kilogram (kg)" },
    { value: "2", label: "Gram (g)" },
    { value: "3", label: "Milligram (mg)" },
    { value: "4", label: "Liter (L)" },
    { value: "5", label: "Milliliter (ml)" },
    { value: "6", label: "Pieces" }
  ]

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Order Details</CardTitle>
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
              name="expectedDate"
              label="Expected Date"
              type="date"
              value={formState.data.expectedDate}
              onChange={(e) => formState.updateField('expectedDate', e.target.value)}
              error={formState.errors.expectedDate}
              required
            />

            <FormSelect
              name="status"
              label="Status"
              value={formState.data.status}
              onChange={(e) => formState.updateField('status', e.target.value)}
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Pending Approval", label: "Pending Approval" },
                { value: "Approved", label: "Approved" },
                { value: "Partially Received", label: "Partially Received" },
                { value: "Fully Received", label: "Fully Received" },
                { value: "Cancelled", label: "Cancelled" },
                { value: "Rejected", label: "Rejected" }
              ]}
              placeholder="Select status"
            />

            <FormSelect
              name="currency"
              label="Currency"
              value={formState.data.currency}
              onChange={(e) => formState.updateField('currency', e.target.value)}
              options={[
                { value: "PKR", label: "Pakistani Rupee (PKR)" },
                { value: "USD", label: "US Dollar (USD)" },
                { value: "EUR", label: "Euro (EUR)" }
              ]}
              placeholder="Select currency"
            />
          </div>

          <FormInput
            name="notes"
            label="Notes"
            value={formState.data.notes}
            onChange={(e) => formState.updateField('notes', e.target.value)}
            placeholder="Special instructions or notes"
            multiline
            rows={3}
          />

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Purchase Order Items</h3>
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
                    name={`quantity_${index}`}
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />

                  <FormSelect
                    name={`unitId_${index}`}
                    label="Unit of Measure"
                    value={item.unitId}
                    onChange={(e) => {
                      const unit = units.find(u => u.value === e.target.value)
                      updateItem(index, 'unitId', e.target.value)
                      updateItem(index, 'unitOfMeasure', unit?.label || '')
                    }}
                    options={units}
                    placeholder="Select unit"
                  />

                  <FormInput
                    name={`unitPrice_${index}`}
                    label="Unit Price"
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Total Price</label>
                    <div className="text-lg font-semibold text-green-600">
                          {formState.data.currency} {item.totalPrice.toFixed(2)}
                        </div>
                  </div>
                </div>
              </Card>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet. Click "Add Item" to get started.</p>
              </div>
            )}

            {items.length > 0 && (
              <Card className="p-4 bg-green-50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formState.data.currency} {totalAmount.toFixed(2)}
                  </span>
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