"use client"

import { useState, useEffect } from "react"
import { Form, FormInput, FormSelect, FormActions, FormField } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import { purchaseOrdersApi, suppliersApi, sitesApi, rawMaterialsApi, type PurchaseOrder } from "@/services"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"

interface PurchaseOrderItem {
  rawMaterialId: number
  quantity: number
  unitPrice: number
}

interface PurchaseOrderFormProps {
  initialData?: Partial<PurchaseOrder>
  onSubmit: (data: {
    supplierId: number
    siteId?: number
    expectedDate: string
    items: PurchaseOrderItem[]
    status?: 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled'
  }) => Promise<void>
  submitLabel?: string
}

export function PurchaseOrderForm({ initialData, onSubmit, submitLabel = "Save" }: PurchaseOrderFormProps) {
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([])
  const [sites, setSites] = useState<Array<{ id: number; name: string }>>([])
  const [rawMaterials, setRawMaterials] = useState<Array<{ id: number; name: string; code: string }>>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [loadingSites, setLoadingSites] = useState(true)
  const [loadingRawMaterials, setLoadingRawMaterials] = useState(true)
  const [items, setItems] = useState<Array<PurchaseOrderItem & { id: string }>>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSuppliers(true)
        setLoadingSites(true)
        setLoadingRawMaterials(true)

        const [suppliersData, sitesData, rawMaterialsData] = await Promise.all([
          suppliersApi.getSuppliers(),
          sitesApi.getSites(),
          rawMaterialsApi.getRawMaterials(),
        ])

        setSuppliers(suppliersData.map((s: { id: number; name: string }) => ({ id: s.id, name: s.name })))
        setSites(sitesData.map((s: { id: number; name: string }) => ({ id: s.id, name: s.name })))
        setRawMaterials(rawMaterialsData.map((rm: { id: number; name: string; code: string }) => ({ 
          id: rm.id, 
          name: rm.name,
          code: rm.code 
        })))

        // Set initial items if editing
        if (initialData?.items && initialData.items.length > 0) {
          setItems(initialData.items.map((item, index) => ({
            id: `item-${index}`,
            rawMaterialId: item.rawMaterialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })))
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoadingSuppliers(false)
        setLoadingSites(false)
        setLoadingRawMaterials(false)
      }
    }
    fetchData()
  }, [initialData?.items])

  const initialFormData = {
    supplierId: initialData?.supplierId?.toString() || "",
    siteId: initialData?.siteId?.toString() || "",
    expectedDate: initialData?.expectedDate 
      ? new Date(initialData.expectedDate).toISOString().split('T')[0]
      : "",
    status: initialData?.status || "Draft",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    supplierId: {
      required: true,
      message: "Supplier is required"
    },
    expectedDate: {
      required: true,
      message: "Expected date is required"
    },
  })

  const addItem = () => {
    setItems([...items, {
      id: `item-${Date.now()}`,
      rawMaterialId: 0,
      quantity: 0,
      unitPrice: 0,
    }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof PurchaseOrderItem, value: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (data: typeof initialFormData) => {
    formState.setLoading(true)
    formState.clearErrors()
    
    try {
      const errors = validation.validateForm(data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      if (items.length === 0) {
        formState.setError("At least one item is required")
        return
      }

      // Validate items
      for (const item of items) {
        if (!item.rawMaterialId || item.rawMaterialId === 0) {
          formState.setError("All items must have a raw material selected")
          return
        }
        if (item.quantity <= 0) {
          formState.setError("All items must have a quantity greater than 0")
          return
        }
        if (item.unitPrice < 0) {
          formState.setError("All items must have a valid unit price")
          return
        }
      }

      if (!data.supplierId) {
        formState.setError("Supplier is required")
        return
      }

      await onSubmit({
        supplierId: parseInt(data.supplierId, 10),
        siteId: data.siteId ? parseInt(data.siteId, 10) : undefined,
        expectedDate: new Date(data.expectedDate).toISOString(),
        items: items.map(item => ({
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        status: data.status as 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled',
      })
      
      formState.setSuccess("Purchase order saved successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save purchase order"
      formState.setError(errorMessage)
    } finally {
      formState.setLoading(false)
    }
  }

  const calculateItemTotal = (item: PurchaseOrderItem) => {
    return item.quantity * item.unitPrice
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  return (
    <Form 
      onSubmit={handleSubmit} 
      loading={formState.isLoading}
      error={formState.error || undefined}
      success={formState.success || undefined}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <FormSelect
          name="supplierId"
          label="Supplier"
          value={formState.data.supplierId}
          onChange={(value) => formState.updateField('supplierId', value)}
          error={formState.errors.supplierId}
          options={suppliers.map(s => ({ value: s.id.toString(), label: s.name }))}
          placeholder={loadingSuppliers ? "Loading suppliers..." : "Select supplier"}
          disabled={loadingSuppliers}
          required
        />
        <FormSelect
          name="siteId"
          label="Site (Optional)"
          value={formState.data.siteId}
          onChange={(value) => formState.updateField('siteId', value)}
          error={formState.errors.siteId}
          options={sites.map(s => ({ value: s.id.toString(), label: s.name }))}
          placeholder={loadingSites ? "Loading sites..." : "Select site (optional)"}
          disabled={loadingSites}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
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
          onChange={(value) => formState.updateField('status', value)}
          error={formState.errors.status}
          options={[
            { value: "Draft", label: "Draft" },
            { value: "Pending", label: "Pending" },
            { value: "Approved", label: "Approved" },
            { value: "Received", label: "Received" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
        />
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Items</h3>
          <Button type="button" onClick={addItem} variant="outline" size="sm">
            <Plus />
            Add Item
          </Button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            No items added. Click "Add Item" to add items to this purchase order.
          </div>
        )}

        {items.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Item {index + 1}</h4>
              <Button
                type="button"
                onClick={() => removeItem(item.id)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <FormField name={`item-${item.id}-rawMaterial`} label="Raw Material">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={item.rawMaterialId}
                  onChange={(e) => updateItem(item.id, 'rawMaterialId', parseInt(e.target.value, 10))}
                  required
                  disabled={loadingRawMaterials}
                >
                  <option value="0">{loadingRawMaterials ? "Loading..." : "Select raw material"}</option>
                  {rawMaterials.map(rm => (
                    <option key={rm.id} value={rm.id}>
                      {rm.code} - {rm.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField name={`item-${item.id}-quantity`} label="Quantity">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={item.quantity || ""}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  required
                />
              </FormField>

              <FormField name={`item-${item.id}-unitPrice`} label="Unit Price">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={item.unitPrice || ""}
                  onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </FormField>
            </div>

            <div className="text-right text-sm font-medium">
              Total: ${calculateItemTotal(item).toFixed(2)}
            </div>
          </div>
        ))}

        {items.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Grand Total</div>
                <div className="text-2xl font-bold">${calculateTotal().toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FormActions 
        loading={formState.isLoading}
        submitLabel={submitLabel}
      />
    </Form>
  )
}

