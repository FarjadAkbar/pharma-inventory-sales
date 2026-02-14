"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormCheckbox, FormActions, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Package } from "lucide-react"
import { goodsReceiptsApi, purchaseOrdersApi, sitesApi, suppliersApi, type PurchaseOrder } from "@/services"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GoodsReceiptItem {
  purchaseOrderItemId: number
  // Raw material id (from PO item) - display only
  rawMaterialId?: number
  receivedQuantity: number
  acceptedQuantity: number
  rejectedQuantity: number
  batchNumber?: string
  expiryDate?: string
  // Display fields (from PO item)
  materialName?: string
  materialCode?: string
  orderedQuantity?: number
  unit?: string
}

interface GoodsReceiptFormProps {
  initialData?: {
    poId?: string
    poNumber?: string
    receivedDate?: string
    remarks?: string
    status?: 'Draft' | 'Verified' | 'Completed'
    items?: Array<{
      purchaseOrderItemId: number
      receivedQuantity: number
      acceptedQuantity: number
      rejectedQuantity: number
      batchNumber?: string
      expiryDate?: string
    }>
  }
  onSubmit: (data: {
    purchaseOrderId: number
    receivedDate: string
    remarks?: string
    items: Array<{
      purchaseOrderItemId: number
      receivedQuantity: number
      acceptedQuantity: number
      rejectedQuantity: number
      batchNumber?: string
      expiryDate?: string
    }>
    status?: 'Draft' | 'Verified' | 'Completed'
  }) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function GoodsReceiptForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: GoodsReceiptFormProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<Array<{ value: string; label: string }>>([])
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [loadingPOs, setLoadingPOs] = useState(true)
  const [items, setItems] = useState<GoodsReceiptItem[]>([])

  const initialFormData = {
    poId: initialData?.poId || "",
    receivedDate: initialData?.receivedDate || new Date().toISOString().split('T')[0],
    remarks: initialData?.remarks || "",
    status: initialData?.status || "Draft",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    poId: {
      required: true,
      message: "Please select a purchase order"
    },
    receivedDate: {
      required: true,
      message: "Please select a received date"
    }
  })

  useEffect(() => {
    fetchPurchaseOrders()
    if (initialData?.poId) {
      fetchPurchaseOrder(parseInt(initialData.poId))
    }
  }, [])

  useEffect(() => {
    if (initialData?.items && initialData.items.length > 0) {
      // Map initial items
      const mappedItems = initialData.items.map(item => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        receivedQuantity: item.receivedQuantity,
        acceptedQuantity: item.acceptedQuantity,
        rejectedQuantity: item.rejectedQuantity,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      }))
      setItems(mappedItems)
    }
  }, [initialData])

  const fetchPurchaseOrders = async () => {
    try {
      setLoadingPOs(true)
      const pos = await purchaseOrdersApi.getPurchaseOrders()
      // Filter only approved POs
      const approvedPOs = pos.filter(po => po.status === 'Approved')
      setPurchaseOrders(approvedPOs.map(po => ({
        value: po.id.toString(),
        label: `${po.poNumber} - ${po.supplier?.name || `Supplier #${po.supplierId}`}`
      })))
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error)
    } finally {
      setLoadingPOs(false)
    }
  }

  const fetchPurchaseOrder = async (poId: number) => {
    try {
      const po = await purchaseOrdersApi.getPurchaseOrder(poId.toString())
      setSelectedPO(po)
      
      // Initialize items from PO items
      if (po.items && po.items.length > 0) {
        const poItems = po.items.map(item => ({
          purchaseOrderItemId: item.id,
          rawMaterialId: item.rawMaterialId,
          receivedQuantity: 0,
          acceptedQuantity: 0,
          rejectedQuantity: 0,
          batchNumber: "",
          expiryDate: "",
          materialName: item.rawMaterial?.name || `Material #${item.rawMaterialId}`,
          materialCode: item.rawMaterial?.code || "",
          orderedQuantity: Number(item.quantity),
          unit: "", // Will be fetched from raw material if needed
        }))
        setItems(poItems)
      }
    } catch (error) {
      console.error("Failed to fetch purchase order:", error)
    }
  }

  const handlePOChange = (poId: string) => {
    formState.updateField('poId', poId)
    if (poId) {
      fetchPurchaseOrder(parseInt(poId))
    } else {
      setSelectedPO(null)
      setItems([])
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

      if (items.length === 0) {
        formState.setError("Please add at least one item")
        return
      }

      // Validate items
      for (const item of items) {
        if (item.receivedQuantity <= 0) {
          formState.setError(`Received quantity must be greater than 0 for item ${item.purchaseOrderItemId}`)
          return
        }
        if (item.acceptedQuantity + item.rejectedQuantity !== item.receivedQuantity) {
          formState.setError(`Accepted + Rejected must equal Received quantity for item ${item.purchaseOrderItemId}`)
          return
        }
        if (item.receivedQuantity > (item.orderedQuantity || 0)) {
          formState.setError(`Received quantity (${item.receivedQuantity}) cannot exceed ordered quantity (${item.orderedQuantity})`)
          return
        }
      }

      await onSubmit({
        purchaseOrderId: parseInt(formState.data.poId),
        receivedDate: formState.data.receivedDate,
        remarks: formState.data.remarks || undefined,
        items: items.map(item => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          receivedQuantity: item.receivedQuantity,
          acceptedQuantity: item.acceptedQuantity,
          rejectedQuantity: item.rejectedQuantity,
          batchNumber: item.batchNumber || undefined,
          expiryDate: item.expiryDate || undefined,
        })),
        status: formState.data.status as 'Draft' | 'Verified' | 'Completed',
      })

      formState.setSuccess("Goods receipt saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save goods receipt")
    } finally {
      formState.setLoading(false)
    }
  }

  const updateItem = (index: number, field: keyof GoodsReceiptItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Auto-calculate accepted quantity if received changes
    if (field === 'receivedQuantity') {
      const received = parseFloat(value) || 0
      const rejected = updatedItems[index].rejectedQuantity || 0
      updatedItems[index].acceptedQuantity = Math.max(0, received - rejected)
    }
    
    // Auto-calculate rejected quantity if received changes
    if (field === 'rejectedQuantity') {
      const received = updatedItems[index].receivedQuantity || 0
      const rejected = parseFloat(value) || 0
      updatedItems[index].acceptedQuantity = Math.max(0, received - rejected)
    }
    
    setItems(updatedItems)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goods Receipt Details</CardTitle>
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
              name="poId"
              label="Purchase Order *"
              value={formState.data.poId}
              onChange={(value) => handlePOChange(value)}
              error={formState.errors.poId}
              required
              options={purchaseOrders}
              placeholder={loadingPOs ? "Loading purchase orders..." : "Select a purchase order"}
              disabled={loadingPOs}
            />

            <FormInput
              name="receivedDate"
              label="Received Date *"
              type="date"
              value={formState.data.receivedDate}
              onChange={(e) => formState.updateField('receivedDate', e.target.value)}
              error={formState.errors.receivedDate}
              required
            />

            <FormSelect
              name="status"
              label="Status"
              value={formState.data.status}
              onChange={(value) => formState.updateField('status', value)}
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Verified", label: "Verified" },
                { value: "Completed", label: "Completed" },
              ]}
              placeholder="Select status"
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

          {/* Items Section */}
          {selectedPO && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Received Items</h3>
                <div className="text-sm text-muted-foreground">
                  PO: {selectedPO.poNumber} | Supplier: {selectedPO.supplier?.name || `#${selectedPO.supplierId}`}
                </div>
              </div>

              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{item.materialName || `Item ${index + 1}`}</h4>
                      {item.materialCode && (
                        <p className="text-sm text-muted-foreground">Code: {item.materialCode}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        PO Item ID: {item.purchaseOrderItemId}
                        {item.rawMaterialId ? ` • Material ID: ${item.rawMaterialId}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ordered: {item.orderedQuantity || 0} {item.unit || ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        const updated = items.filter((_, i) => i !== index)
                        setItems(updated)
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Received Quantity *</Label>
                      <Input
                        type="number"
                        min="0"
                        max={item.orderedQuantity || 0}
                        value={item.receivedQuantity}
                        onChange={(e) => updateItem(index, 'receivedQuantity', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Max: {item.orderedQuantity || 0}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Accepted Quantity *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.acceptedQuantity}
                        onChange={(e) => updateItem(index, 'acceptedQuantity', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rejected Quantity *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.rejectedQuantity}
                        onChange={(e) => updateItem(index, 'rejectedQuantity', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Batch Number</Label>
                      <Input
                        type="text"
                        value={item.batchNumber || ""}
                        onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                        placeholder="Enter batch number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => updateItem(index, 'expiryDate', e.target.value || undefined)}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items in this purchase order or items already received.</p>
                </div>
              )}
            </div>
          )}

          {!selectedPO && formState.data.poId && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading purchase order details...</p>
            </div>
          )}

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
