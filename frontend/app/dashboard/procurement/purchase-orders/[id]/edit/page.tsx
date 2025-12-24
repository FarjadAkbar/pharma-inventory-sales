"use client"

import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PurchaseOrderForm } from "@/components/procurement/purchase-order-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileEdit } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { purchaseOrdersApi } from "@/services"

export default function EditPurchaseOrderPage() {
  const router = useRouter()
  const params = useParams()
  const purchaseOrderId = params.id ? parseInt(params.id as string) : undefined
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (purchaseOrderId) {
      fetchPurchaseOrder()
    }
  }, [purchaseOrderId])

  const fetchPurchaseOrder = async () => {
    if (!purchaseOrderId) return
    
    try {
      setLoading(true)
      const order = await purchaseOrdersApi.getPurchaseOrder(purchaseOrderId.toString())
      setPurchaseOrder(order)
    } catch (error) {
      console.error("Failed to fetch purchase order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    router.push("/dashboard/procurement/purchase-orders")
  }

  const handleCancel = () => {
    router.push("/dashboard/procurement/purchase-orders")
  }

  if (!purchaseOrderId) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Invalid Purchase Order ID</h1>
          <p className="text-muted-foreground mt-2">The purchase order ID is invalid.</p>
        </div>
      </DashboardLayout>
    )
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link 
            href="/dashboard/procurement/purchase-orders" 
            className="hover:text-foreground transition-colors"
          >
            Purchase Orders
          </Link>
          <span>/</span>
          <Link 
            href={`/dashboard/procurement/purchase-orders/${purchaseOrderId}`}
            className="hover:text-foreground transition-colors"
          >
            {purchaseOrder?.poNumber || `PO #${purchaseOrderId}`}
          </Link>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <FileEdit className="h-8 w-8 text-primary" />
                Edit Purchase Order
              </h1>
              {purchaseOrder && (
                <p className="text-muted-foreground mt-1">
                  PO Number: <span className="font-mono font-semibold text-foreground">{purchaseOrder.poNumber}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <PurchaseOrderForm
          purchaseOrderId={purchaseOrderId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  )
}
