"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  ClipboardCheck, 
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Package,
  Calendar,
  Building2,
  User
} from "lucide-react"
import Link from "next/link"
import { goodsReceiptsApi, purchaseOrdersApi, sitesApi, type GoodsReceipt } from "@/services"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { formatDateISO } from "@/lib/utils"

// Map backend GoodsReceipt to frontend format
function mapBackendToFrontend(backendGR: GoodsReceipt): any {
  return {
    id: backendGR.id.toString(),
    grnNumber: backendGR.grnNumber,
    purchaseOrderId: backendGR.purchaseOrderId.toString(),
    poNumber: backendGR.purchaseOrder?.poNumber || `PO-${backendGR.purchaseOrderId}`,
    supplierId: backendGR.purchaseOrder?.supplierId?.toString() || "",
    supplierName: `Supplier #${backendGR.purchaseOrder?.supplierId || ""}`,
    siteId: backendGR.purchaseOrder?.siteId?.toString() || "",
    siteName: backendGR.purchaseOrder?.siteId ? `Site #${backendGR.purchaseOrder.siteId}` : "",
    receivedDate: new Date(backendGR.receivedDate).toISOString(),
    status: backendGR.status,
    remarks: backendGR.remarks || "",
    items: (backendGR.items || []).map((item) => ({
      id: item.id.toString(),
      purchaseOrderItemId: item.purchaseOrderItemId.toString(),
      receivedQuantity: Number(item.receivedQuantity),
      acceptedQuantity: Number(item.acceptedQuantity),
      rejectedQuantity: Number(item.rejectedQuantity),
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : undefined,
    })),
    createdAt: new Date(backendGR.createdAt).toISOString(),
    updatedAt: new Date(backendGR.updatedAt).toISOString(),
  }
}

export default function GoodsReceiptsPage() {
  const [goodsReceipts, setGoodsReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchGoodsReceipts()
  }, [])

  const fetchGoodsReceipts = async () => {
    try {
      setLoading(true)
      const response = await goodsReceiptsApi.getGoodsReceipts({
        search: searchQuery || undefined,
      })

      // Map backend format to frontend format
      const mappedGRNs = response.map(mapBackendToFrontend)
      setGoodsReceipts(mappedGRNs)
    } catch (error) {
      console.error("Failed to fetch goods receipts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGoodsReceipt = async (grn: any) => {
    if (confirm(`Are you sure you want to delete GRN ${grn.grnNumber}?`)) {
      try {
        await goodsReceiptsApi.deleteGoodsReceipt(grn.id)
        fetchGoodsReceipts() // Refresh the list
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

  const calculateStats = () => {
    const total = goodsReceipts.length
    const draft = goodsReceipts.filter(grn => grn.status === "Draft").length
    const verified = goodsReceipts.filter(grn => grn.status === "Verified").length
    const completed = goodsReceipts.filter(grn => grn.status === "Completed").length

    return { total, draft, verified, completed }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "grnNumber",
      header: "GRN Number",
      sortable: true,
      render: (grn: any) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {grn.grnNumber}
        </div>
      ),
    },
    {
      key: "poNumber",
      header: "PO Reference",
      sortable: true,
      render: (grn: any) => (
        <div>
          <div className="font-medium">{grn.poNumber}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {grn.siteName || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "supplierName",
      header: "Supplier",
      sortable: true,
      render: (grn: any) => (
        <div className="text-sm">
          <div className="font-medium">{grn.supplierName || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      sortable: true,
      render: (grn: any) => (
        <div className="text-sm">
          <div className="font-medium">{grn.items?.length || 0} items</div>
          <div className="text-muted-foreground">
            {grn.items?.reduce((sum: number, item: any) => sum + (item.receivedQuantity || 0), 0) || 0} received
          </div>
        </div>
      ),
    },
    {
      key: "receivedDate",
      header: "Received Date",
      sortable: true,
      render: (grn: any) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDateISO(grn.receivedDate)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (grn: any) => getStatusBadge(grn.status),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (grn: any) => formatDateISO(grn.createdAt),
    },
  ]

  const actions = (grn: any) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="PROCUREMENT" screen="goods-receipts" action="read">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/procurement/goods-receipts/${grn.id}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="PROCUREMENT" screen="goods-receipts" action="update">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/procurement/goods-receipts/${grn.id}/edit`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="PROCUREMENT" screen="goods-receipts" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteGoodsReceipt(grn)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goods Receipts</h1>
            <p className="text-muted-foreground">Manage goods receipts and quality control samples</p>
          </div>
          <PermissionGuard module="PROCUREMENT" screen="goods-receipts" action="create">
            <Link href="/dashboard/procurement/goods-receipts/new">
              <Button>
                <Plus />
                Create GRN
              </Button>
            </Link>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total GRNs</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Goods Receipts Table */}
        <UnifiedDataTable
          data={goodsReceipts}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search goods receipts..."
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          actions={actions}
          onRefresh={fetchGoodsReceipts}
          onExport={() => console.log("Export goods receipts")}
          emptyMessage="No goods receipts found. Create your first goods receipt to get started."
        />
      </div>
    </DashboardLayout>
  )
}
