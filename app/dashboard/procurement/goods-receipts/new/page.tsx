"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GoodsReceiptForm } from "@/components/procurement/goods-receipt-form"
import { apiService } from "@/services/api.service"
import type { GoodsReceipt } from "@/types/procurement"

export default function NewGoodsReceiptPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: GoodsReceipt) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.createGoodsReceipt(data)
      if (response.success) {
        router.push("/dashboard/procurement/goods-receipts")
      } else {
        throw new Error(response.message || "Failed to create goods receipt")
      }
    } catch (error: any) {
      console.error("Failed to create goods receipt:", error)
      throw error
    } finally {
      setIsSubmitting(false)
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
          submitLabel={isSubmitting ? "Creating..." : "Create GRN"}
        />
      </div>
    </DashboardLayout>
  )
}
