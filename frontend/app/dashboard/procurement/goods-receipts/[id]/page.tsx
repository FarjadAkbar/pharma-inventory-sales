"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, Package, Calendar, Building2, User } from "lucide-react"
import Link from "next/link"
import { goodsReceiptsApi, type GoodsReceipt } from "@/services"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { formatDateISO } from "@/lib/utils"

export default function ViewGoodsReceiptPage() {
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

  const handleDeleteGoodsReceipt = async () => {
    if (confirm(`Are you sure you want to delete GRN ${goodsReceipt?.grnNumber}?`)) {
      try {
        await goodsReceiptsApi.deleteGoodsReceipt(params.id as string)
        router.push("/dashboard/procurement/goods-receipts")
      } catch (error) {
        console.error("Failed to delete goods receipt:", error)
        alert("Failed to delete goods receipt")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case "Completed":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
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
          <div className="flex items-center gap-4">
            <Link href="/dashboard/procurement/goods-receipts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goods Receipts
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">GRN #{goodsReceipt.grnNumber}</h1>
              <p className="text-muted-foreground">Goods Receipt Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PermissionGuard module="PROCUREMENT" screen="goods-receipts" action="update">
              <Link href={`/dashboard/procurement/goods-receipts/${goodsReceipt.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </PermissionGuard>
            <PermissionGuard module="PROCUREMENT" screen="goods-receipts" action="delete">
              <Button variant="destructive" onClick={handleDeleteGoodsReceipt}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </PermissionGuard>
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
                <label className="text-sm font-medium text-muted-foreground">GRN Number</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{goodsReceipt.grnNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PO Reference</label>
                <p className="text-lg font-semibold">{goodsReceipt.purchaseOrder?.poNumber || `PO-${goodsReceipt.purchaseOrderId}`}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {getStatusBadge(goodsReceipt.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Received Date</label>
                <p className="text-lg flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateISO(goodsReceipt.receivedDate)}
                </p>
              </div>
              {goodsReceipt.remarks && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Remarks</label>
                  <p className="text-sm text-muted-foreground">{goodsReceipt.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Items Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Items Count</label>
                <p className="text-lg flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {goodsReceipt.items?.length || 0} items
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Received</label>
                <p className="text-lg">
                  {goodsReceipt.items?.reduce((sum, item) => sum + Number(item.receivedQuantity), 0) || 0} units
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Accepted</label>
                <p className="text-lg text-green-600">
                  {goodsReceipt.items?.reduce((sum, item) => sum + Number(item.acceptedQuantity), 0) || 0} units
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Rejected</label>
                <p className="text-lg text-red-600">
                  {goodsReceipt.items?.reduce((sum, item) => sum + Number(item.rejectedQuantity), 0) || 0} units
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDateISO(goodsReceipt.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Received Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goodsReceipt.items && goodsReceipt.items.length > 0 ? (
                goodsReceipt.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">PO Item ID</label>
                        <p className="font-semibold">#{item.purchaseOrderItemId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Received</label>
                        <p className="text-lg font-semibold text-green-600">
                          {Number(item.receivedQuantity)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Accepted</label>
                        <p className="text-lg text-green-600">
                          {Number(item.acceptedQuantity)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Rejected</label>
                        <p className="text-lg text-red-600">
                          {Number(item.rejectedQuantity)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                        <p className="text-lg font-mono">{item.batchNumber || "N/A"}</p>
                      </div>
                    </div>
                    {item.expiryDate && (
                      <div className="mt-2">
                        <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                        <p className="text-sm">{formatDateISO(item.expiryDate)}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No items found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
