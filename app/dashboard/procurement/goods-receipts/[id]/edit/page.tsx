"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GoodsReceiptForm } from "@/components/procurement/goods-receipt-form"
import { apiService } from "@/services/api.service"
import type { GoodsReceipt } from "@/types/procurement"

export default function EditGoodsReceiptPage() {
  const router = useRouter()
  const params = useParams()
  const [goodsReceipt, setGoodsReceipt] = useState<GoodsReceipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchGoodsReceipt(params.id as string)
    }
  }, [params.id])

  const fetchGoodsReceipt = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getGoodsReceipts({ search: id, limit: 1 })
      if (response.success && response.data?.goodsReceipts?.length > 0) {
        setGoodsReceipt(response.data.goodsReceipts[0])
      } else {
        throw new Error("Goods receipt not found")
      }
    } catch (error) {
      console.error("Failed to fetch goods receipt:", error)
      router.push("/dashboard/procurement/goods-receipts")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: GoodsReceipt) => {
    setIsSubmitting(true)
    try {
      const response = await apiService.updateGoodsReceipt({ ...data, id: params.id })
      if (response.success) {
        router.push("/dashboard/procurement/goods-receipts")
      } else {
        throw new Error(response.message || "Failed to update goods receipt")
      }
    } catch (error: any) {
      console.error("Failed to update goods receipt:", error)
      throw error
    } finally {
      setIsSubmitting(false)
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
          initialData={goodsReceipt}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? "Updating..." : "Update GRN"}
        />
      </div>
    </DashboardLayout>
  )
}
