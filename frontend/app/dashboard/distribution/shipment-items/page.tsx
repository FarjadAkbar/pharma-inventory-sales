"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, Truck, CheckCircle, AlertTriangle, MapPin } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface ShipmentItem {
  id: string
  shipmentId: string
  shipmentNumber: string
  salesOrderId: string
  salesOrderNumber: string
  productId: string
  productName: string
  productCode: string
  batchId: string
  batchNumber: string
  lotNumber: string
  expiryDate: string
  orderedQuantity: number
  shippedQuantity: number
  unitId: string
  unitName: string
  unitPrice: number
  totalPrice: number
  location: string
  status: "pending" | "picked" | "packed" | "shipped" | "delivered" | "returned"
  pickedBy?: string
  pickedByName?: string
  pickedAt?: string
  packedBy?: string
  packedByName?: string
  packedAt?: string
  shippedAt?: string
  deliveredAt?: string
  trackingNumber?: string
  specialInstructions?: string
  createdAt: string
  updatedAt: string
}

export default function ShipmentItemsPage() {
  const [items, setItems] = useState<ShipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchShipmentItems()
  }, [searchQuery, pagination.page, statusFilter])

  const fetchShipmentItems = async () => {
    try {
      setLoading(true)
      const response = await apiService.getShipmentItems({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const itemData = response.data as {
          items: ShipmentItem[]
          pagination: { page: number; pages: number; total: number }
        }
        setItems(itemData.items || [])
        setPagination(itemData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch shipment items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleEdit = (item: ShipmentItem) => {
    window.location.href = `/dashboard/distribution/shipment-items/${item.id}`
  }

  const handleDelete = async (item: ShipmentItem) => {
    if (confirm(`Are you sure you want to delete shipment item for ${item.productName}?`)) {
      try {
        await apiService.deleteShipmentItem(item.id)
        fetchShipmentItems()
      } catch (error) {
        console.error("Failed to delete shipment item:", error)
      }
    }
  }

  const handleStatusUpdate = async (item: ShipmentItem, newStatus: string) => {
    try {
      await apiService.updateShipmentItemStatus(item.id, newStatus)
      fetchShipmentItems()
    } catch (error) {
      console.error("Failed to update shipment item status:", error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "picked":
        return "bg-blue-100 text-blue-800"
      case "packed":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "returned":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
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

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const calculateStats = () => {
    const totalItems = items.length
    const pendingItems = items.filter(i => i.status === "pending").length
    const shippedItems = items.filter(i => i.status === "shipped").length
    const deliveredItems = items.filter(i => i.status === "delivered").length
    const totalValue = items.reduce((sum, i) => sum + i.totalPrice, 0)

    return { totalItems, pendingItems, shippedItems, deliveredItems, totalValue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (item: ShipmentItem) => (
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
      header: "Batch Info",
      render: (item: ShipmentItem) => {
        const isExpired = isExpired(item.expiryDate)
        const isExpiringSoon = isExpiringSoon(item.expiryDate)
        
        return (
          <div className="space-y-1 text-sm">
            <div className="font-medium">Batch: {item.batchNumber}</div>
            <div>Lot: {item.lotNumber}</div>
            <div className={`flex items-center gap-1 ${
              isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : "text-green-600"
            }`}>
              <span>Expiry: {formatDateISO(item.expiryDate)}</span>
              {isExpired && <AlertTriangle className="h-3 w-3" />}
              {isExpiringSoon && !isExpired && <AlertTriangle className="h-3 w-3" />}
            </div>
          </div>
        )
      },
    },
    {
      key: "quantities",
      header: "Quantities",
      render: (item: ShipmentItem) => (
        <div className="space-y-1 text-sm">
          <div>Ordered: {item.orderedQuantity} {item.unitName}</div>
          <div>Shipped: {item.shippedQuantity} {item.unitName}</div>
          <div className="font-medium">Price: ${item.totalPrice.toFixed(2)}</div>
        </div>
      ),
    },
    {
      key: "shipment",
      header: "Shipment",
      render: (item: ShipmentItem) => (
        <div className="space-y-1 text-sm">
          <div className="font-medium">{item.shipmentNumber}</div>
          <div className="text-muted-foreground">SO: {item.salesOrderNumber}</div>
          {item.trackingNumber && (
            <div className="text-muted-foreground">Tracking: {item.trackingNumber}</div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (item: ShipmentItem) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{item.location}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: ShipmentItem) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(item.status)}
          <Badge className={getStatusBadgeColor(item.status)}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "timeline",
      header: "Timeline",
      render: (item: ShipmentItem) => (
        <div className="space-y-1 text-sm">
          {item.pickedAt && (
            <div>Picked: {formatDateISO(item.pickedAt)}</div>
          )}
          {item.packedAt && (
            <div>Packed: {formatDateISO(item.packedAt)}</div>
          )}
          {item.shippedAt && (
            <div>Shipped: {formatDateISO(item.shippedAt)}</div>
          )}
          {item.deliveredAt && (
            <div>Delivered: {formatDateISO(item.deliveredAt)}</div>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipment Items</h1>
            <p className="text-muted-foreground">Track individual items within shipments</p>
          </div>

          <PermissionGuard module="DISTRIBUTION" screen="shipment_items" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/distribution/shipment-items/new")}>
              <Plus />
              Add Item
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.shippedItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
            <CardDescription>Select a status to filter shipment items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Items" },
                { value: "pending", label: "Pending" },
                { value: "picked", label: "Picked" },
                { value: "packed", label: "Packed" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "returned", label: "Returned" },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipment Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Shipment Items</CardTitle>
            <CardDescription>A list of all shipment items with their status and tracking information.</CardDescription>
          </CardHeader>
          <CardContent>
            <UnifiedDataTable
              data={items}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search shipment items..."
              actions={(item: ShipmentItem) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="DISTRIBUTION" screen="shipment_items" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  {item.status === "pending" && (
                    <PermissionGuard module="DISTRIBUTION" screen="shipment_items" action="update">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatusUpdate(item, "picked")}
                        className="text-blue-600"
                      >
                        Mark Picked
                      </Button>
                    </PermissionGuard>
                  )}
                  {item.status === "picked" && (
                    <PermissionGuard module="DISTRIBUTION" screen="shipment_items" action="update">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatusUpdate(item, "packed")}
                        className="text-purple-600"
                      >
                        Mark Packed
                      </Button>
                    </PermissionGuard>
                  )}
                  <PermissionGuard module="DISTRIBUTION" screen="shipment_items" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
