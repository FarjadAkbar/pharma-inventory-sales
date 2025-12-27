"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Thermometer,
  Droplets,
  MapPin,
  AlertCircle,
  Shield,
  Pause,
  RotateCcw
} from "lucide-react"
import { warehouseApi } from "@/services"
import type { InventoryItem, InventoryFilters } from "@/types/warehouse"
import { formatDateISO } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function InventoryPage() {
  const router = useRouter()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<InventoryFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)

  useEffect(() => {
    fetchInventoryItems()
  }, [searchQuery, filters, pagination.page])

  const fetchInventoryItems = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getInventoryItems({
        ...filters,
      })

      if (response && Array.isArray(response)) {
        setInventoryItems(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch inventory items:", error)
      toast.error("Failed to load inventory items")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleDelete = (item: InventoryItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      await warehouseApi.deleteInventoryItem(itemToDelete.id.toString())
      toast.success("Inventory item deleted successfully")
      fetchInventoryItems()
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete inventory item")
    }
  }

  const handleMove = (item: InventoryItem) => {
    router.push(`/dashboard/warehouse/movements/new?fromItem=${item.id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>
      case "Quarantine":
        return <Badge className="bg-yellow-100 text-yellow-800"><Shield className="h-3 w-3 mr-1" />Quarantine</Badge>
      case "Hold":
        return <Badge className="bg-orange-100 text-orange-800"><Pause className="h-3 w-3 mr-1" />Hold</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case "Reserved":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Reserved</Badge>
      case "In Transit":
        return <Badge className="bg-purple-100 text-purple-800"><RotateCcw className="h-3 w-3 mr-1" />In Transit</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getMaterialIcon = (materialName: string) => {
    if (materialName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (materialName.includes("API")) return <AlertCircle className="h-4 w-4" />
    if (materialName.includes("Cellulose")) return <Droplets className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysToExpiry < 0) return { status: "Expired", color: "text-red-600" }
    if (daysToExpiry <= 30) return { status: "Critical", color: "text-red-600" }
    if (daysToExpiry <= 90) return { status: "Warning", color: "text-orange-600" }
    return { status: "Good", color: "text-green-600" }
  }

  const calculateStats = () => {
    const total = inventoryItems.length
    const available = inventoryItems.filter(item => item.status === "Available").length
    const quarantine = inventoryItems.filter(item => item.status === "Quarantine").length
    const hold = inventoryItems.filter(item => item.status === "Hold").length
    const rejected = inventoryItems.filter(item => item.status === "Rejected").length
    const reserved = inventoryItems.filter(item => item.status === "Reserved").length

    return { total, available, quarantine, hold, rejected, reserved }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "itemCode",
      header: "Item Code",
      sortable: true,
      render: (item: InventoryItem) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {item.itemCode}
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      sortable: true,
      render: (item: InventoryItem) => (
        <div>
          <div className="flex items-center gap-2">
            {getMaterialIcon(item.materialName)}
            <span className="font-medium">{item.materialName}</span>
          </div>
          <div className="text-sm text-muted-foreground">{item.materialCode}</div>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      sortable: true,
      render: (item: InventoryItem) => (
        <div className="text-sm">
          <div className="font-medium">{item.batchNumber}</div>
          <div className="text-muted-foreground">Exp: {formatDateISO(item.expiryDate)}</div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (item: InventoryItem) => (
        <div className="text-sm">
          <div className="font-medium">{item.quantity.toLocaleString()} {item.unit}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (item: InventoryItem) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {item.locationId || item.location || "N/A"}
          </div>
          {item.zone && (
            <div className="text-muted-foreground">Zone {item.zone}</div>
          )}
          {item.rack && item.shelf && (
            <div className="text-muted-foreground text-xs">Rack {item.rack}, Shelf {item.shelf}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item: InventoryItem) => getStatusBadge(item.status),
    },
    {
      key: "conditions",
      header: "Conditions",
      sortable: true,
      render: (item: InventoryItem) => (
        <div className="text-sm">
          {item.temperature !== undefined && (
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              {item.temperature}°C
            </div>
          )}
          {item.humidity !== undefined && (
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {item.humidity}%
            </div>
          )}
          {item.temperature === undefined && item.humidity === undefined && (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "expiry",
      header: "Expiry Date",
      sortable: true,
      render: (item: InventoryItem) => {
        if (!item.expiryDate) return <span className="text-muted-foreground">N/A</span>
        const expiryStatus = getExpiryStatus(item.expiryDate)
        return (
          <div className="text-sm">
            <div className={expiryStatus.color}>{formatDateISO(item.expiryDate)}</div>
            <div className={`text-xs ${expiryStatus.color}`}>{expiryStatus.status}</div>
          </div>
        )
      },
    },
  ]

  const filterOptions = [
    {
      key: "materialId",
      label: "Material",
      type: "select" as const,
      options: [
        { value: "1", label: "Paracetamol API" },
        { value: "2", label: "Microcrystalline Cellulose" },
        { value: "3", label: "Sodium Starch Glycolate" },
        { value: "4", label: "Paracetamol Tablets" },
        { value: "5", label: "Ibuprofen Tablets" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Available", label: "Available" },
        { value: "Quarantine", label: "Quarantine" },
        { value: "Hold", label: "Hold" },
        { value: "Rejected", label: "Rejected" },
        { value: "Reserved", label: "Reserved" },
        { value: "In Transit", label: "In Transit" },
      ],
    },
    {
      key: "zone",
      label: "Zone",
      type: "select" as const,
      options: [
        { value: "A", label: "Zone A (Raw Materials)" },
        { value: "B", label: "Zone B (Finished Goods)" },
        { value: "C", label: "Zone C (Quarantine)" },
      ],
    },
    {
      key: "expiryDateFrom",
      label: "Expiry From",
      type: "date" as const,
    },
    {
      key: "expiryDateTo",
      label: "Expiry To",
      type: "date" as const,
    },
  ]

  const actions = (item: InventoryItem) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/inventory/${item.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/inventory/${item.id}/edit`)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {item.status === "Available" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => handleMove(item)}
          title="Create Movement"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700"
        onClick={() => handleDelete(item)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">View and manage current stock levels, locations, and status</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quarantine</CardTitle>
              <Shield className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.quarantine}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hold</CardTitle>
              <Pause className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.hold}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reserved</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.reserved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <UnifiedDataTable
          data={inventoryItems}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search inventory items..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={filterOptions}
          onFiltersChange={handleFiltersChange}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            onPageChange: handlePageChange
          }}
          actions={actions}
          onRefresh={fetchInventoryItems}
          onExport={() => console.log("Export inventory")}
          emptyMessage="No inventory items found."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Inventory Item"
          description={`Are you sure you want to delete inventory item ${itemToDelete?.itemCode}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
