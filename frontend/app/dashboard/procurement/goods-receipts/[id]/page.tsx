"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, CheckCircle, Clock, XCircle, AlertTriangle, Package, FileText, TestTube, Calendar, Building2, User } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { GoodsReceipt } from "@/types/procurement"
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

  const handleDeleteGoodsReceipt = async () => {
    if (confirm(`Are you sure you want to delete GRN ${goodsReceipt?.grnNumber}?`)) {
      try {
        const response = await apiService.deleteGoodsReceipt(goodsReceipt!.id)
        if (response.success) {
          router.push("/dashboard/procurement/goods-receipts")
        } else {
          alert("Failed to delete goods receipt")
        }
      } catch (error) {
        console.error("Failed to delete goods receipt:", error)
        alert("Failed to delete goods receipt")
      }
    }
  }

  const handleRequestQCSample = async () => {
    if (confirm(`Are you sure you want to request QC sample for GRN ${goodsReceipt?.grnNumber}?`)) {
      try {
        const response = await apiService.requestQCSample(goodsReceipt!.id)
        if (response.success) {
          fetchGoodsReceipt(params.id as string) // Refresh data
        } else {
          alert("Failed to request QC sample")
        }
      } catch (error) {
        console.error("Failed to request QC sample:", error)
        alert("Failed to request QC sample")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "QC Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />QC Approved</Badge>
      case "Pending QC":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending QC</Badge>
      case "QC Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />QC Rejected</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
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
            {goodsReceipt.status === "Pending QC" && !goodsReceipt.qcSampleRequested && (
              <Button onClick={handleRequestQCSample} className="bg-blue-600 hover:bg-blue-700">
                <TestTube className="h-4 w-4 mr-2" />
                Request QC Sample
              </Button>
            )}
            <Link href={`/dashboard/procurement/goods-receipts/${goodsReceipt.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteGoodsReceipt}>
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
                <label className="text-sm font-medium text-muted-foreground">GRN Number</label>
                <p className="font-mono text-lg font-semibold text-orange-600">{goodsReceipt.grnNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">PO Reference</label>
                <p className="text-lg font-semibold">{goodsReceipt.poNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-lg">{goodsReceipt.supplierName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Site</label>
                <p className="text-lg flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {goodsReceipt.siteName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Received Date</label>
                <p className="text-lg flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateISO(goodsReceipt.receivedDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Received By</label>
                <p className="text-lg flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {goodsReceipt.receivedByName}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* QC Status & Documents */}
          <Card>
            <CardHeader>
              <CardTitle>QC Status & Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {getStatusBadge(goodsReceipt.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">QC Sample</label>
                <div className="flex items-center gap-2">
                  {goodsReceipt.qcSampleRequested ? (
                    <Badge className="bg-blue-100 text-blue-800">
                      <TestTube className="h-3 w-3 mr-1" />
                      Requested
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Requested</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CoA Attached</label>
                <div className="flex items-center gap-2">
                  {goodsReceipt.coaAttached ? (
                    <Badge className="bg-green-100 text-green-800">
                      <FileText className="h-3 w-3 mr-1" />
                      Attached
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Attached</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Items Count</label>
                <p className="text-lg flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {goodsReceipt.items.length} items
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Received</label>
                <p className="text-lg">
                  {goodsReceipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0)} units
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
              {goodsReceipt.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Material</label>
                      <p className="font-semibold">{item.materialName}</p>
                      <p className="text-sm text-muted-foreground">{item.materialCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ordered Quantity</label>
                      <p className="text-lg">{item.orderedQuantity} {item.unitOfMeasure}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Received Quantity</label>
                      <p className="text-lg font-semibold text-green-600">
                        {item.receivedQuantity} {item.unitOfMeasure}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                      <p className="text-lg font-mono">{item.batchNumber || "N/A"}</p>
                    </div>
                  </div>
                  {item.condition && (
                    <div className="mt-2">
                      <label className="text-sm font-medium text-muted-foreground">Condition</label>
                      <p className="text-sm">{item.condition}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {goodsReceipt.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{goodsReceipt.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
