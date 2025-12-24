"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PurchaseOrderForm } from "@/components/procurement/purchase-order-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

export default function NewPurchaseOrderPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard/procurement/purchase-orders")
  }

  const handleCancel = () => {
    router.push("/dashboard/procurement/purchase-orders")
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
          <span className="text-foreground">Create New</span>
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
                <FileText className="h-8 w-8 text-primary" />
                Create Purchase Order
              </h1>
              <p className="text-muted-foreground mt-1">
                Create a new purchase order for procurement
              </p>
            </div>
          </div>
        </div>

        <PurchaseOrderForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  )
}
