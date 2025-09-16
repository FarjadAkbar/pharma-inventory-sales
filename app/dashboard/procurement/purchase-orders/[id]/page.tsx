"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, XCircle, AlertTriangle, DollarSign, Calendar, Building2, User, Package } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { PurchaseOrder } from "@/types/procurement"
import { formatDateISO } from "@/lib/utils"

export default function ViewPurchaseOrderPage() {
  const router = useRouter()
  const params = useParams()
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPurchaseOrder(params.id as string)
    }
  }, [params.id])

  const fetchPurchaseOrder = async (id: string) => {
    try {
      setLoading(true)
      const response = await apiService.getPurchaseOrders({ search: id, limit: 1 })
      if (response.success && response.data?.purchaseOrders?.length > 0) {
        setPurchaseOrder(response.data.purchaseOrders[0])
      } else {
        throw new Error("Purchase order not found")
      }
    } catch (error) {
      console.error("Failed to fetch purchase order:", error)
      router.push("/dashboard/procurement/purchase-orders")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePurchaseOrder = async () => {
    if (confirm(`Are you sure you want to delete Purchase Order ${purchaseOrder?.poNumber}?`)) {
      try {
        const response = await apiService.deletePurchaseOrder(purchaseOrder!.id)
        if (response.success) {
          router.push("/dashboard/procurement/purchase-orders")
        } else {
          alert("Failed to delete purchase order")
        }
      } catch (error) {
        console.error("Failed to delete purchase order:", error)
        alert("Failed to delete purchase order")
      }
    }
  }

  const handleApprove = async () => {
    if (confirm(`Are you sure you want to approve Purchase Order ${purchaseOrder?.poNumber}?`)) {
      try {
        const response = await apiService.approvePurchaseOrder(purchaseOrder!.id)
        if (response.success) {
          fetchPurchaseOrder(params.id as string) // Refresh data
        } else {
          alert("Failed to approve purchase order")
        }
      } catch (error) {
        console.error("Failed to approve purchase order:", error)
        alert("Failed to approve purchase order")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Pending Approval":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>
      case "Partially Received":
        return <Badge className="bg-blue-100 text-blue-800"><AlertTriangle className="h-3 w-3 mr-1" />Partially Received</Badge>
      case "Fully Received":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Fully Received</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
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

  if (!purchaseOrder) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-destructive">Purchase order not found</h1>
          <p className="text-muted-foreground mt-2">The purchase order you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/procurement/purchase-orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Purchase Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">PO #{purchaseOrder.poNumber}</h1>
              <p className="text-muted-foreground">Purchase Order Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {purchaseOrder.status === "Pending Approval" && (
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            <Link href={`/dashboard/procurement/purchase-orders/${purchaseOrder.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeletePurchaseOrder}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{purchaseOrder.poNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-lg font-semibold">{purchaseOrder.supplierName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Site</label>
                <p className="text-lg flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {purchaseOrder.siteName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Expected Date</label>
                <p className="text-lg flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateISO(purchaseOrder.expectedDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {getStatusBadge(purchaseOrder.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <p className="text-lg flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {purchaseOrder.createdByName}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                  <DollarSign className="h-5 w-5" />
                  {purchaseOrder.totalAmount.toLocaleString()} {purchaseOrder.currency}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Items Count</label>
                <p className="text-lg flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {purchaseOrder.items.length} items
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Quantity</label>
                <p className="text-lg">
                  {purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0)} units
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDateISO(purchaseOrder.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchaseOrder.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Material</label>
                      <p className="font-semibold">{item.materialName}</p>
                      <p className="text-sm text-muted-foreground">{item.materialCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                      <p className="text-lg">{item.quantity} {item.unitOfMeasure}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                      <p className="text-lg">{item.unitPrice.toLocaleString()} {purchaseOrder.currency}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Price</label>
                      <p className="text-lg font-semibold text-green-600">
                        {item.totalPrice.toLocaleString()} {purchaseOrder.currency}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {purchaseOrder.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{purchaseOrder.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
