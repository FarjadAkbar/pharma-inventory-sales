"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormInput, FormSelect, FormActions, FormTextarea } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation } from "@/lib/form-validation"
import type { QCSample } from "@/types/quality-control"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Package, TestTube } from "lucide-react"
import { goodsReceiptsApiService, type GoodsReceipt, type GoodsReceiptItem } from "@/services/goods-receipts-api.service"
import { qualityControlApi } from "@/services"
import { rawMaterialsApiService, type RawMaterial } from "@/services/raw-materials-api.service"
import { purchaseOrdersApiService, type PurchaseOrder, type PurchaseOrderItem } from "@/services/purchase-orders-api.service"
import { MEASUREMENT_UNITS } from "@/lib/constants/units"

interface QCSampleFormProps {
  initialData?: Partial<QCSample>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function QCSampleForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = "Save" 
}: QCSampleFormProps) {
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([])
  const [selectedGR, setSelectedGR] = useState<GoodsReceipt | null>(null)
  const [selectedItem, setSelectedItem] = useState<GoodsReceiptItem | null>(null)
  const [qcTests, setQCTests] = useState<any[]>([])
  const [selectedTests, setSelectedTests] = useState<number[]>([])

  const initialFormData = {
    sourceType: initialData?.sourceType || "GRN",
    sourceId: initialData?.sourceId || "",
    sourceReference: initialData?.sourceReference || "",
    goodsReceiptItemId: (initialData as any)?.goodsReceiptItemId || "",
    materialId: initialData?.materialId || "",
    materialName: initialData?.materialName || "",
    materialCode: initialData?.materialCode || "",
    batchNumber: initialData?.batchNumber || "",
    quantity: initialData?.quantity?.toString() || "",
    unit: initialData?.unit || "",
    priority: initialData?.priority || "Normal",
    dueDate: initialData?.dueDate || "",
    remarks: initialData?.remarks || "",
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    sourceType: {
      required: true,
      message: "Please select a source type"
    },
    sourceId: {
      required: true,
      message: "Please select a goods receipt"
    },
    goodsReceiptItemId: {
      required: true,
      message: "Please select a goods receipt item"
    },
    materialId: {
      required: true,
      message: "Material ID is required. Please select a goods receipt item."
    },
    materialName: {
      required: true,
      message: "Please enter material name"
    },
    materialCode: {
      required: true,
      message: "Please enter material code"
    },
    batchNumber: {
      required: true,
      message: "Please enter batch number"
    },
    quantity: {
      required: true,
      message: "Please enter a quantity"
    },
    unit: {
      required: true,
      message: "Please select a unit"
    }
  })

  useEffect(() => {
    fetchGoodsReceipts()
    fetchQCTests()
  }, [])

  useEffect(() => {
    if (initialData?.sourceId) {
      fetchGoodsReceipt(initialData.sourceId)
    }
  }, [initialData?.sourceId])

  const fetchGoodsReceipts = async () => {
    try {
      const receipts = await goodsReceiptsApiService.getGoodsReceipts({ limit: 100 })
      setGoodsReceipts(receipts)
    } catch (error) {
      console.error("Failed to fetch goods receipts:", error)
    }
  }

  const fetchGoodsReceipt = async (id: string) => {
    try {
      const receipt = await goodsReceiptsApiService.getGoodsReceipt(id)
      setSelectedGR(receipt)
      if (receipt.items && (initialData as any)?.goodsReceiptItemId) {
        const item = receipt.items.find(i => i.id.toString() === (initialData as any).goodsReceiptItemId)
        if (item) {
          handleItemSelect(item)
        }
      }
    } catch (error) {
      console.error("Failed to fetch goods receipt:", error)
    }
  }

  const fetchQCTests = async () => {
    try {
      const tests = await qualityControlApi.getQCTests({ status: 'Active' })
      setQCTests(Array.isArray(tests) ? tests : [])
    } catch (error) {
      console.error("Failed to fetch QC tests:", error)
    }
  }

  const handleGRSelect = async (grnNumber: string) => {
    const receipt = goodsReceipts.find(gr => gr.grnNumber === grnNumber)
    if (receipt) {
      setSelectedGR(receipt)
      formState.updateField('sourceId', receipt.id.toString())
      formState.updateField('sourceReference', receipt.grnNumber)
      // Fetch full receipt with items
      const fullReceipt = await goodsReceiptsApiService.getGoodsReceipt(receipt.id.toString())
      setSelectedGR(fullReceipt)
      setSelectedItem(null)
      formState.updateField('goodsReceiptItemId', "")
      formState.updateField('materialId', "")
      formState.updateField('materialName', "")
      formState.updateField('materialCode', "")
      formState.updateField('batchNumber', "")
    }
  }

  const handleItemSelect = async (item: GoodsReceiptItem) => {
    setSelectedItem(item)
    formState.updateField('goodsReceiptItemId', item.id.toString())
    formState.updateField('batchNumber', item.batchNumber || "")
    formState.updateField('quantity', item.acceptedQuantity.toString())
    formState.clearErrors() // Clear any previous errors
    
    let materialId: number | null = null
    
    // Try to get materialId from purchaseOrderItem if available
    if (item.purchaseOrderItem?.rawMaterialId) {
      materialId = item.purchaseOrderItem.rawMaterialId
    } else if (selectedGR && item.purchaseOrderItemId) {
      // If purchaseOrderItem is not populated, fetch it from the purchase order
      try {
        const purchaseOrder = await purchaseOrdersApiService.getPurchaseOrder(selectedGR.purchaseOrderId.toString())
        const poItem = purchaseOrder.items?.find((pi: PurchaseOrderItem) => pi.id === item.purchaseOrderItemId)
        if (poItem?.rawMaterialId) {
          materialId = poItem.rawMaterialId
        }
      } catch (error) {
        console.error("Failed to fetch purchase order item:", error)
      }
    }
    
    if (materialId) {
      formState.updateField('materialId', materialId.toString())
      
      // Fetch material details to auto-populate name and code
      try {
        const response = await rawMaterialsApiService.getRawMaterial(materialId.toString())
        // Handle both ApiResponse format and direct material format
        let material: RawMaterial | null = null
        if (response && typeof response === 'object') {
          if ('data' in response && response.data) {
            material = response.data as unknown as RawMaterial
          } else if ('id' in response) {
            material = response as unknown as RawMaterial
          }
        }
        if (material && material.id) {
          formState.updateField('materialName', material.name || "")
          formState.updateField('materialCode', material.code || "")
        }
      } catch (error) {
        console.error("Failed to fetch material details:", error)
        // Material ID is set, but name/code will need manual entry
      }
    } else {
      // If rawMaterialId is not available, clear materialId and show error
      formState.updateField('materialId', "")
      formState.setError("Material ID not found. The purchase order item may not have a raw material assigned. Please contact administrator.")
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

      if (!selectedItem) {
        formState.setError("Please select a goods receipt item")
        return
      }

      // Validate materialId is a valid number
      const materialId = formState.data.materialId ? parseInt(formState.data.materialId) : null
      if (!materialId || isNaN(materialId)) {
        formState.setError("Material ID is required and must be a valid number. Please select a goods receipt item with material information.")
        return
      }

      const sampleData = {
        sourceType: formState.data.sourceType === "GRN" ? "GoodsReceipt" : formState.data.sourceType,
        sourceId: parseInt(formState.data.sourceId),
        sourceReference: formState.data.sourceReference,
        goodsReceiptItemId: parseInt(formState.data.goodsReceiptItemId),
        materialId: materialId,
        materialName: formState.data.materialName,
        materialCode: formState.data.materialCode,
        batchNumber: formState.data.batchNumber,
        quantity: parseFloat(formState.data.quantity),
        unit: formState.data.unit,
        priority: formState.data.priority,
        dueDate: formState.data.dueDate || undefined,
        remarks: formState.data.remarks || undefined,
        requestedBy: 1, // Mock user ID - should come from auth context
      }

      await onSubmit(sampleData)
      formState.setSuccess("QC sample saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save QC sample")
    } finally {
      formState.setLoading(false)
    }
  }

  const toggleTest = (testId: number) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    )
  }

  const sourceTypes = [
    { value: "GRN", label: "Goods Receipt Note (GRN)" },
    { value: "Batch", label: "Batch" },
  ]

  const priorities = [
    { value: "Low", label: "Low" },
    { value: "Normal", label: "Normal" },
    { value: "High", label: "High" },
    { value: "Urgent", label: "Urgent" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Source Information</CardTitle>
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
                name="sourceType"
                label="Source Type *"
                value={formState.data.sourceType}
                onChange={(value) => formState.updateField('sourceType', value)}
                error={formState.errors.sourceType}
                required
                options={sourceTypes}
                placeholder="Select source type"
              />

              <FormSelect
                name="sourceId"
                label="Goods Receipt *"
                value={selectedGR?.grnNumber || ""}
                onChange={(value) => handleGRSelect(value)}
                error={formState.errors.sourceId}
                required
                options={goodsReceipts.map(gr => ({
                  value: gr.grnNumber,
                  label: `${gr.grnNumber} - ${gr.receivedDate ? new Date(gr.receivedDate).toLocaleDateString() : ''}`
                }))}
                placeholder="Select goods receipt"
              />

              {selectedGR && selectedGR.items && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Select Item *</label>
                  <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                    {selectedGR.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedItem?.id === item.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              Item ID: {item.id} | PO Item: {item.purchaseOrderItemId}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Accepted: {item.acceptedQuantity} | Batch: {item.batchNumber || "N/A"}
                            </div>
                          </div>
                          {selectedItem?.id === item.id && (
                            <Package className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Form>
        </CardContent>
      </Card>

      {selectedItem && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sample Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  name="materialName"
                  label="Material Name *"
                  value={formState.data.materialName}
                  onChange={(e) => formState.updateField('materialName', e.target.value)}
                  error={formState.errors.materialName}
                  placeholder="Enter material name"
                  required
                />

                <FormInput
                  name="materialCode"
                  label="Material Code *"
                  value={formState.data.materialCode}
                  onChange={(e) => formState.updateField('materialCode', e.target.value)}
                  error={formState.errors.materialCode}
                  placeholder="Enter material code"
                  required
                />

                <FormInput
                  name="batchNumber"
                  label="Batch Number *"
                  value={formState.data.batchNumber}
                  onChange={(e) => formState.updateField('batchNumber', e.target.value)}
                  error={formState.errors.batchNumber}
                  required
                  placeholder="Enter batch number"
                />

                <FormInput
                  name="quantity"
                  label="Sample Quantity *"
                  value={formState.data.quantity}
                  onChange={(e) => formState.updateField('quantity', e.target.value)}
                  error={formState.errors.quantity}
                  required
                  type="number"
                  step="0.01"
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
                  name="priority"
                  label="Priority"
                  value={formState.data.priority}
                  onChange={(value) => formState.updateField('priority', value)}
                  options={priorities}
                  placeholder="Select priority"
                />

                <FormInput
                  name="dueDate"
                  label="Due Date"
                  value={formState.data.dueDate}
                  onChange={(e) => formState.updateField('dueDate', e.target.value)}
                  type="date"
                  placeholder="Select due date"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assign QC Tests (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {qcTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active QC tests available</p>
                ) : (
                  qcTests.map((test) => (
                    <div
                      key={test.id}
                      onClick={() => toggleTest(test.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                        selectedTests.includes(test.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TestTube className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {test.code} • {test.category}
                          </div>
                        </div>
                      </div>
                      {selectedTests.includes(test.id) && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={formState.isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={formState.isLoading}
        >
          {formState.isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  )
}

