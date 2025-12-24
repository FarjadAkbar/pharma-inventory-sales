"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GoodsReceiptForm } from "@/components/procurement/goods-receipt-form"
import { goodsReceiptsApi, type GoodsReceipt } from "@/services"

export default function EditGoodsReceiptPage() {
  const router = useRouter()
  const params = useParams()
  const [goodsReceipt, setGoodsReceipt] = useState<GoodsReceipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchGoodsReceipt(params.id as string)
    }
  }, [params.id])

  const fetchGoodsReceipt = async (id: string) => {
    try {
      setLoading(true)
      const grn = await goodsReceiptsApi.getGoodsReceipt(id)
      setGoodsReceipt(grn)
    } catch (error) {
      console.error("Failed to fetch goods receipt:", error)
      router.push("/dashboard/procurement/goods-receipts")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: {
    receivedDate?: string
    remarks?: string
    items?: Array<{
      purchaseOrderItemId: number
      receivedQuantity: number
      acceptedQuantity: number
      rejectedQuantity: number
      batchNumber?: string
      expiryDate?: string
    }>
    status?: 'Draft' | 'Verified' | 'Completed'
  }) => {
    try {
      await goodsReceiptsApi.updateGoodsReceipt(params.id as string, data)
      router.push("/dashboard/procurement/goods-receipts")
    } catch (error) {
      console.error("Failed to update goods receipt:", error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/procurement/goods-receipts")
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!goodsReceipt) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Goods receipt not found</h1>
          <p className="text-muted-foreground mt-2">The goods receipt you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  // Map backend format to form format
  const formData = {
    poId: goodsReceipt.purchaseOrderId.toString(),
    poNumber: goodsReceipt.purchaseOrder?.poNumber || "",
    supplierId: goodsReceipt.purchaseOrder?.supplierId?.toString() || "",
    supplierName: "",
    siteId: goodsReceipt.purchaseOrder?.siteId?.toString() || "",
    siteName: "",
    receivedDate: new Date(goodsReceipt.receivedDate).toISOString().split('T')[0],
    receivedById: "",
    receivedByName: "",
    status: goodsReceipt.status,
    qcSampleRequested: false,
    coaAttached: false,
    notes: goodsReceipt.remarks || "",
    items: (goodsReceipt.items || []).map(item => ({
      materialId: item.purchaseOrderItem?.rawMaterialId?.toString() || "",
      materialName: "",
      materialCode: "",
      orderedQuantity: item.purchaseOrderItem?.quantity || 0,
      receivedQuantity: Number(item.receivedQuantity),
      unitOfMeasure: "",
      batchNumber: item.batchNumber,
      condition: "",
    })),
    grnNumber: goodsReceipt.grnNumber,
    createdAt: new Date(goodsReceipt.createdAt).toISOString(),
    updatedAt: new Date(goodsReceipt.updatedAt).toISOString(),
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Goods Receipt</h1>
            <p className="text-muted-foreground">Update goods receipt information and QC details</p>
          </div>
        </div>

        <GoodsReceiptForm
          initialData={formData as any}
          onSubmit={handleSubmit as any}
          onCancel={handleCancel}
          submitLabel="Update GRN"
        />
      </div>
    </DashboardLayout>
  )
}
