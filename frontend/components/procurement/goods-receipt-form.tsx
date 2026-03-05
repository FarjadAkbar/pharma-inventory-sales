"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormInput, FormSelect, FormActions, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import { Package } from "lucide-react"
import { purchaseOrdersApi, type PurchaseOrder } from "@/services"
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
        formState.setLoading(false)
        return
      }

      if (items.length === 0) {
        formState.setError("Please select a purchase order with line items.")
        formState.setLoading(false)
        return
      }

      const receivedDate = formState.data.receivedDate || new Date().toISOString().split("T")[0]
      const datePart = receivedDate.replace(/-/g, "")

      for (const item of items) {
        if (item.receivedQuantity <= 0) {
          formState.setError(`Received quantity must be greater than 0 for "${item.materialName || "item"}".`)
          formState.setLoading(false)
          return
        }
        if (item.receivedQuantity > (item.orderedQuantity ?? 0)) {
          formState.setError(`Received (${item.receivedQuantity}) cannot exceed ordered (${item.orderedQuantity ?? 0}) for "${item.materialName || "item"}".`)
          formState.setLoading(false)
          return
        }
        const accepted = item.receivedQuantity - (item.rejectedQuantity || 0)
        if (accepted < 0) {
          formState.setError(`Rejected quantity cannot exceed received for "${item.materialName || "item"}".`)
          formState.setLoading(false)
          return
        }
      }

      await onSubmit({
        purchaseOrderId: parseInt(formState.data.poId, 10),
        receivedDate: formState.data.receivedDate,
        remarks: formState.data.remarks || undefined,
        items: items.map((item, index) => {
          const accepted = item.receivedQuantity - (item.rejectedQuantity || 0)
          const autoBatch = item.batchNumber?.trim() || `GR-${datePart}-${String(index + 1).padStart(3, "0")}`
          return {
            purchaseOrderItemId: item.purchaseOrderItemId,
            receivedQuantity: item.receivedQuantity,
            acceptedQuantity: accepted,
            rejectedQuantity: item.rejectedQuantity || 0,
            batchNumber: autoBatch,
            expiryDate: item.expiryDate || undefined,
          }
        }),
        status: formState.data.status as "Draft" | "Verified" | "Completed",
      })

      formState.setSuccess("Goods receipt saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save goods receipt")
    } finally {
      formState.setLoading(false)
    }
  }

  const updateItem = (index: number, field: "receivedQuantity" | "rejectedQuantity", value: number) => {
    const updatedItems = [...items]
    const item = { ...updatedItems[index] }
    const num = typeof value === "number" ? value : parseFloat(String(value)) || 0

    if (field === "receivedQuantity") {
      const ordered = item.orderedQuantity ?? 0
      const received = Math.min(Math.max(0, num), ordered)
      item.receivedQuantity = received
      const rejected = Math.min(item.rejectedQuantity || 0, received)
      item.rejectedQuantity = rejected
      item.acceptedQuantity = received - rejected
    } else {
      const received = item.receivedQuantity || 0
      const rejected = Math.min(Math.max(0, num), received)
      item.rejectedQuantity = rejected
      item.acceptedQuantity = received - rejected
    }
    updatedItems[index] = item
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
                <Card key={`${item.purchaseOrderItemId}-${index}`} className="p-4">
                  <div className="mb-4">
                    <h4 className="font-medium">{item.materialName || `Item ${index + 1}`}</h4>
                    {item.materialCode && (
                      <p className="text-sm text-muted-foreground">Code: {item.materialCode}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      PO Item ID: {item.purchaseOrderItemId}
                      {item.rawMaterialId ? ` • Material ID: ${item.rawMaterialId}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ordered: {item.orderedQuantity ?? 0} {item.unit || ""}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Received Quantity *</Label>
                      <Input
                        type="number"
                        min={0}
                        max={item.orderedQuantity ?? 0}
                        step={1}
                        value={item.receivedQuantity}
                        onChange={(e) => updateItem(index, "receivedQuantity", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Max: {item.orderedQuantity ?? 0}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Rejected Quantity</Label>
                      <Input
                        type="number"
                        min={0}
                        max={item.receivedQuantity ?? 0}
                        step={1}
                        value={item.rejectedQuantity ?? 0}
                        onChange={(e) => updateItem(index, "rejectedQuantity", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Accepted (auto)</Label>
                      <Input
                        type="text"
                        readOnly
                        value={item.acceptedQuantity}
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Received − Rejected
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Batch Number</Label>
                      <Input
                        type="text"
                        value={item.batchNumber || ""}
                        onChange={(e) => {
                          const next = [...items]
                          next[index] = { ...next[index], batchNumber: e.target.value }
                          setItems(next)
                        }}
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => {
                          const next = [...items]
                          next[index] = { ...next[index], expiryDate: e.target.value || undefined }
                          setItems(next)
                        }}
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
