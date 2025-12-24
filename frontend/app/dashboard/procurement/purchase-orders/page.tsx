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
  ShoppingCart, 
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Building2
} from "lucide-react"
import Link from "next/link"
import { purchaseOrdersApi, type PurchaseOrder } from "@/services"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { formatDateISO } from "@/lib/utils"
import { toast } from "@/lib/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Map backend PurchaseOrder to frontend format
function mapBackendToFrontend(backendPO: PurchaseOrder): any {
  return {
    id: backendPO.id.toString(),
    poNumber: backendPO.poNumber,
    supplier_id: backendPO.supplierId.toString(),
    supplierName: backendPO.supplier?.name || `Supplier #${backendPO.supplierId}`,
    siteId: backendPO.siteId?.toString() || "",
    name: backendPO.site?.name || (backendPO.siteId ? `Site #${backendPO.siteId}` : ""),
    location: backendPO.site?.address || backendPO.site?.city || "",
    expected_date: new Date(backendPO.expectedDate).toISOString(),
    status: backendPO.status,
    total_amount: Number(backendPO.totalAmount),
    currency: "PKR",
    items: (backendPO.items || []).map((item) => ({
      id: item.id.toString(),
      materialId: item.rawMaterialId.toString(),
      materialName: item.rawMaterial?.name || `Material #${item.rawMaterialId}`,
      materialCode: item.rawMaterial?.code || "",
      qty: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    created_at: new Date(backendPO.createdAt).toISOString(),
    updated_at: new Date(backendPO.updatedAt).toISOString(),
  }
}

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [poToDelete, setPoToDelete] = useState<any>(null)

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)
      const response = await purchaseOrdersApi.getPurchaseOrders({
        search: searchQuery || undefined,
      })

      // Map backend format to frontend format
      const mappedOrders = response.map(mapBackendToFrontend)
      setPurchaseOrders(mappedOrders)
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (po: any) => {
    setPoToDelete(po)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!poToDelete) return
    
    try {
      await purchaseOrdersApi.deletePurchaseOrder(poToDelete.id)
      toast.success("Purchase order deleted successfully", `Purchase Order ${poToDelete.poNumber} has been deleted.`)
      fetchPurchaseOrders() // Refresh the list
    } catch (error) {
      console.error("Failed to delete purchase order:", error)
      toast.error("Failed to delete purchase order", "Please try again later.")
    } finally {
      setDeleteDialogOpen(false)
      setPoToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Received":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Received</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
  }

  const calculateStats = () => {
    const total = purchaseOrders.length
    const draft = purchaseOrders.filter(po => po.status === "Draft").length
    const pending = purchaseOrders.filter(po => po.status === "Pending").length
    const approved = purchaseOrders.filter(po => po.status === "Approved").length
    const totalValue = purchaseOrders.reduce((sum, po) => sum + (typeof po.total_amount === 'string' ? parseFloat(po.total_amount) : po.total_amount), 0)

    return { total, draft, pending, approved, totalValue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "poNumber",
      header: "PO Number",
      sortable: true,
      render: (po: any) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {po.poNumber}
        </div>
      ),
    },
    {
      key: "name",
      header: "Site",
      sortable: true,
      render: (po: any) => (
        <div>
          <div className="font-medium">{po.name || "N/A"}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {po.location || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "supplier_id",
      header: "Supplier",
      sortable: true,
      render: (po: any) => (
        <div className="text-sm">
          <div className="font-medium">{po.supplierName || `Supplier #${po.supplier_id}`}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      sortable: true,
      render: (po: any) => (
        <div className="text-sm">
          <div className="font-medium">{po.items?.length || 0} items</div>
          <div className="text-muted-foreground">
            {po.items?.reduce((sum: number, item: any) => sum + (item.qty || 0), 0) || 0} total qty
          </div>
        </div>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      sortable: true,
      render: (po: any) => (
        <div className="text-sm">
          <div className="font-medium flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {typeof po.total_amount === 'string' ? po.total_amount : po.total_amount.toLocaleString()} {po.currency || "PKR"}
          </div>
        </div>
      ),
    },
    {
      key: "expected_date",
      header: "Expected Date",
      sortable: true,
      render: (po: any) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDateISO(po.expected_date)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (po: any) => getStatusBadge(po.status),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (po: any) => formatDateISO(po.created_at),
    },
  ]

  const actions = (po: any) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="read">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/procurement/purchase-orders/${po.id}/view`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="update">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/procurement/purchase-orders/${po.id}/edit`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteClick(po)}
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
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage pharmaceutical purchase orders and procurement</p>
          </div>
          <PermissionGuard module="PROCUREMENT" screen="purchase-orders" action="create">
            <Link href="/dashboard/procurement/purchase-orders/new">
              <Button>
                <Plus />
                Create PO
              </Button>
            </Link>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalValue.toLocaleString()} PKR
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Orders Table */}
        <UnifiedDataTable
          data={purchaseOrders}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search purchase orders..."
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          actions={actions}
          onRefresh={fetchPurchaseOrders}
          onExport={() => console.log("Export purchase orders")}
          emptyMessage="No purchase orders found. Create your first purchase order to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Purchase Order"
          description={`Are you sure you want to delete Purchase Order ${poToDelete?.poNumber}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
