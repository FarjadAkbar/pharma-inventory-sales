"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  Building2,
  Package,
  Calculator
} from "lucide-react"
import { purchaseOrdersApi } from "@/services"
import type { PurchaseOrder } from "@/types/purchase-orders"
import { PermissionGuard } from "@/components/auth/permission-guard"

export default function PurchaseOrderViewPage() {
  const router = useRouter()
  const params = useParams()
  const purchaseOrderId = params.id ? parseInt(params.id as string) : undefined
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
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
      const response = await purchaseOrdersApi.getAllPurchaseOrders()
      if (response.status && response.data) {
        const orders = Array.isArray(response.data) ? response.data : [response.data]
        const order = orders.find(po => po.id === purchaseOrderId)
        if (order) {
          setPurchaseOrder(order)
        }
      }
    } catch (error) {
      console.error("Failed to fetch purchase order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!purchaseOrder) return
    
    if (confirm(`Are you sure you want to delete Purchase Order #${purchaseOrder.id}?`)) {
      try {
        const response = await purchaseOrdersApi.deletePurchaseOrder(purchaseOrder.id)
        if (response.status) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Completed":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
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
          <h1 className="text-2xl font-bold text-destructive">Purchase Order Not Found</h1>
          <p className="text-muted-foreground mt-2">The purchase order you're looking for doesn't exist.</p>
          <Button 
            onClick={() => router.push("/dashboard/procurement/purchase-orders")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard/procurement/purchase-orders")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Purchase Order #{purchaseOrder.id}</h1>
              <p className="text-muted-foreground">View purchase order details and items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="update">
              <Button
                onClick={() => router.push(`/dashboard/procurement/purchase-orders/${purchaseOrder.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </PermissionGuard>
            <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="delete">
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Header Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Purchase Order Information
                </CardTitle>
                <CardDescription>
                  Basic details and status information
                </CardDescription>
              </div>
              {getStatusBadge(purchaseOrder.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Site
                </div>
                <div className="font-medium">{purchaseOrder.name || "N/A"}</div>
                <div className="text-sm text-muted-foreground">{purchaseOrder.location || "N/A"}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Supplier
                </div>
                <div className="font-medium">Supplier #{purchaseOrder.supplier_id}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Expected Date
                </div>
                <div className="font-medium">{new Date(purchaseOrder.expected_date).toLocaleDateString()}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Total Amount
                </div>
                <div className="font-medium text-lg">
                  {typeof purchaseOrder.total_amount === 'string' ? purchaseOrder.total_amount : purchaseOrder.total_amount.toLocaleString()} {purchaseOrder.currency}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created Date
                </div>
                <div className="font-medium">{new Date(purchaseOrder.created_at).toLocaleDateString()}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Last Updated
                </div>
                <div className="font-medium">{new Date(purchaseOrder.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
            
            {purchaseOrder.note && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Notes</div>
                  <div className="text-sm">{purchaseOrder.note}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Items ({purchaseOrder.items.length})
            </CardTitle>
            <CardDescription>
              Raw materials and quantities in this purchase order
            </CardDescription>
          </CardHeader>
          <CardContent>
            {purchaseOrder.items.length > 0 ? (
              <div className="space-y-4">
                {purchaseOrder.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Material</div>
                        <div className="font-medium">{item.material_name || `Material #${item.material_id}`}</div>
                        {item.material_description && (
                          <div className="text-sm text-muted-foreground">{item.material_description}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Quantity</div>
                        <div className="font-medium">{item.qty}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Unit</div>
                        <div className="font-medium">{item.unit_name || `Unit #${item.unit_id}`}</div>
                        {item.unit_type && (
                          <div className="text-sm text-muted-foreground">{item.unit_type}</div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Unit Price</div>
                        <div className="font-medium">{item.unit_price.toFixed(2)} {purchaseOrder.currency}</div>
                        <div className="text-sm text-muted-foreground">
                          Total: {(item.qty * item.unit_price).toFixed(2)} {purchaseOrder.currency}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Grand Total</div>
                    <div className="text-2xl font-bold">
                      {typeof purchaseOrder.total_amount === 'string' ? purchaseOrder.total_amount : purchaseOrder.total_amount.toFixed(2)} {purchaseOrder.currency}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items found in this purchase order
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
