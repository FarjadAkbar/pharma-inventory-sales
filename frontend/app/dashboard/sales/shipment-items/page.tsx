"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Eye,
  Trash2,
  MapPin,
} from "lucide-react"
import { distributionApi } from "@/services"
import { formatDateISO } from "@/lib/utils"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface ShipmentItemRow {
  id: string
  shipmentId: string
  shipmentNumber: string
  salesOrderId: string
  salesOrderNumber: string
  productId: string
  productName: string
  productCode: string
  batchNumber: string
  lotNumber?: string
  expiryDate?: string
  orderedQuantity: number
  shippedQuantity: number
  unitId?: string
  unitName: string
  unitPrice?: number
  totalPrice?: number
  location: string
  status: string
  pickedBy?: string
  pickedByName?: string
  pickedAt?: string
  packedBy?: string
  packedByName?: string
  packedAt?: string
  shippedAt?: string
  deliveredAt?: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export default function ShipmentItemsPage() {
  const router = useRouter()
  const [items, setItems] = useState<ShipmentItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ status?: string }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ShipmentItemRow | null>(null)

  useEffect(() => {
    fetchShipmentItems()
  }, [searchQuery, filters, pagination.page])

  const fetchShipmentItems = async () => {
    try {
      setLoading(true)
      const response = await distributionApi.getShipmentItems({
        search: searchQuery || undefined,
        status: filters.status || undefined,
        page: pagination.page,
        limit: 10,
      }) as { success?: boolean; data?: { items?: ShipmentItemRow[]; pagination?: { page: number; pages: number; total: number } } }

      if (response?.data) {
        const list = response.data.items ?? []
        const pag = response.data.pagination ?? { page: 1, pages: 1, total: list.length }
        setItems(Array.isArray(list) ? list : [])
        setPagination({ page: pag.page, pages: pag.pages, total: pag.total })
      }
    } catch (error) {
      console.error("Failed to fetch shipment items:", error)
      toast.error("Failed to load shipment items")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { status?: string })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (item: ShipmentItemRow) => {
    router.push(`/dashboard/sales/shipments/${item.shipmentId}`)
  }

  const handleMarkPicked = async (item: ShipmentItemRow) => {
    try {
      await distributionApi.pickItem({
        shipmentItemId: parseInt(item.id, 10),
        pickedQuantity: item.orderedQuantity ?? 0,
        pickedBy: 1,
      })
      toast.success("Item marked as picked")
      fetchShipmentItems()
    } catch (error) {
      console.error("Failed to update item:", error)
      toast.error("Failed to mark as picked")
    }
  }

  const handleMarkPacked = async (item: ShipmentItemRow) => {
    try {
      await distributionApi.packItem({
        shipmentItemId: parseInt(item.id, 10),
        packedQuantity: item.orderedQuantity ?? 0,
        packedBy: 1,
      })
      toast.success("Item marked as packed")
      fetchShipmentItems()
    } catch (error) {
      console.error("Failed to update item:", error)
      toast.error("Failed to mark as packed")
    }
  }

  const handleDelete = (item: ShipmentItemRow) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    try {
      toast.info("Delete single shipment item may not be supported; delete the shipment instead.")
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      toast.error("Failed to delete item")
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const s = (status || "").toLowerCase()
    const map: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800",
      allocated: "bg-slate-100 text-slate-800",
      picked: "bg-blue-100 text-blue-800",
      packed: "bg-purple-100 text-purple-800",
      shipped: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      returned: "bg-red-100 text-red-800",
    }
    return map[s] ?? "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    const s = (status || "").toLowerCase()
    switch (s) {
      case "picked":
        return <Package className="h-4 w-4 text-blue-500" />
      case "packed":
        return <Package className="h-4 w-4 text-purple-500" />
      case "shipped":
        return <Truck className="h-4 w-4 text-orange-500" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "returned":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const days = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return days <= 30 && days > 0
  }

  const isExpired = (expiryDate?: string) => {
    return expiryDate ? new Date(expiryDate) < new Date() : false
  }

  const stats = {
    total: pagination.total,
    pending: items.filter((i) => (i.status || "").toLowerCase() === "pending" || (i.status || "").toLowerCase() === "allocated").length,
    shipped: items.filter((i) => (i.status || "").toLowerCase() === "shipped").length,
    delivered: items.filter((i) => (i.status || "").toLowerCase() === "delivered").length,
    totalValue: items.reduce((sum, i) => sum + (Number(i.totalPrice) || 0), 0),
  }

  const columns = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      render: (item: ShipmentItemRow) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{item.productName}</div>
            <div className="text-sm text-muted-foreground">{item.productCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      sortable: true,
      render: (item: ShipmentItemRow) => {
        const expired = isExpired(item.expiryDate)
        const soon = isExpiringSoon(item.expiryDate)
        return (
          <div className="space-y-1 text-sm">
            <div className="font-medium">{item.batchNumber}</div>
            {item.expiryDate && (
              <div className={expired ? "text-red-600" : soon ? "text-yellow-600" : "text-muted-foreground"}>
                Expiry: {formatDateISO(item.expiryDate)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: "quantities",
      header: "Qty / Price",
      sortable: true,
      render: (item: ShipmentItemRow) => (
        <div className="space-y-1 text-sm">
          <div>Ordered: {item.orderedQuantity} {item.unitName}</div>
          <div>Shipped: {item.shippedQuantity} {item.unitName}</div>
          {item.totalPrice != null && <div className="font-medium">${Number(item.totalPrice).toFixed(2)}</div>}
        </div>
      ),
    },
    {
      key: "shipment",
      header: "Shipment",
      sortable: true,
      render: (item: ShipmentItemRow) => (
        <div className="space-y-1 text-sm">
          <div className="font-medium">{item.shipmentNumber}</div>
          <div className="text-muted-foreground">SO: {item.salesOrderNumber}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (item: ShipmentItemRow) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{item.location || "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item: ShipmentItemRow) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(item.status)}
          <Badge className={getStatusBadgeColor(item.status)}>
            {(item.status || "pending").charAt(0).toUpperCase() + (item.status || "pending").slice(1)}
          </Badge>
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "pending", label: "Pending" },
        { value: "allocated", label: "Allocated" },
        { value: "picked", label: "Picked" },
        { value: "packed", label: "Packed" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "returned", label: "Returned" },
      ],
    },
  ]

  const actions = (item: ShipmentItemRow) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
        <Eye className="h-4 w-4" />
      </Button>
      {(item.status || "").toLowerCase() === "allocated" && (
        <PermissionGuard module="DISTRIBUTION" action="update">
          <Button variant="ghost" size="sm" onClick={() => handleMarkPicked(item)} className="text-blue-600">
            Mark Picked
          </Button>
        </PermissionGuard>
      )}
      {(item.status || "").toLowerCase() === "picked" && (
        <PermissionGuard module="DISTRIBUTION" action="update">
          <Button variant="ghost" size="sm" onClick={() => handleMarkPacked(item)} className="text-purple-600">
            Mark Packed
          </Button>
        </PermissionGuard>
      )}
      <PermissionGuard module="DISTRIBUTION" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(item)}
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
        <div>
          <h1 className="text-3xl font-bold">Shipment Items</h1>
          <p className="text-muted-foreground">Track individual items within shipments (items are added via Shipments)</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Truck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.shipped}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Shipment Items Table */}
        <UnifiedDataTable
          data={items}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search shipment items..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={filterOptions}
          onFiltersChange={handleFiltersChange}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          onRefresh={fetchShipmentItems}
          onExport={() => console.log("Export shipment items")}
          emptyMessage="No shipment items found. Create a shipment to add items."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Shipment Item"
          description={`Are you sure you want to remove this item (${itemToDelete?.productName}) from the shipment? You may need to edit or delete the shipment instead.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
