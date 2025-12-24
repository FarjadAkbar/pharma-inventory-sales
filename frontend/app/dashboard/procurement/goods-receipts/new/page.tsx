"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GoodsReceiptForm } from "@/components/procurement/goods-receipt-form"
import { goodsReceiptsApi, purchaseOrdersApi } from "@/services"

export default function NewGoodsReceiptPage() {
  const router = useRouter()

  const handleSubmit = async (data: {
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
  }) => {
    try {
      await goodsReceiptsApi.createGoodsReceipt(data)
      router.push("/dashboard/procurement/goods-receipts")
    } catch (error) {
      console.error("Failed to create goods receipt:", error)
      throw error
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/procurement/goods-receipts")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Goods Receipt</h1>
            <p className="text-muted-foreground">Create a new goods receipt (GRN) for received materials</p>
          </div>
        </div>

        <GoodsReceiptForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create GRN"
        />
      </div>
    </DashboardLayout>
  )
}
