"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Package,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  User
} from "lucide-react"
import { warehouseApi } from "@/services"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface StockMovement {
  id: number
  movementNumber: string
  movementType: string
  materialId: number
  materialName: string
  materialCode: string
  batchNumber: string
  quantity: number
  unit: string
  fromLocationId?: string
  toLocationId?: string
  referenceId?: string
  referenceType?: string
  remarks?: string
  performedBy?: number
  performedAt?: string
  createdAt: string
}

export default function MovementsPage() {
  const router = useRouter()
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ movementType?: string; materialId?: string }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(null)

  useEffect(() => {
    fetchMovements()
  }, [searchQuery, filters, pagination.page])

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getMovementRecords({
        ...filters,
      })
      
      if (response && Array.isArray(response)) {
        setMovements(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch movements:", error)
      toast.error("Failed to load stock movements")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination({ ...pagination, page: 1 })
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { movementType?: string; materialId?: string })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleDelete = (movement: StockMovement) => {
    setMovementToDelete(movement)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!movementToDelete) return

    try {
      await warehouseApi.deleteMovementRecord(movementToDelete.id.toString())
      toast.success("Stock movement deleted successfully")
      fetchMovements()
      setDeleteDialogOpen(false)
      setMovementToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete stock movement")
    }
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case "Receipt":
        return <ArrowRight className="h-4 w-4 text-green-600" />
      case "Transfer":
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      case "Consumption":
        return <ArrowLeft className="h-4 w-4 text-red-600" />
      default:
        return <ArrowUpDown className="h-4 w-4" />
    }
  }

  const columns = [
    {
      key: "movementNumber",
      header: "Movement #",
      sortable: true,
      render: (movement: StockMovement) => (
        <div className="font-medium">{movement.movementNumber}</div>
      ),
    },
    {
      key: "movementType",
      header: "Type",
      sortable: true,
      render: (movement: StockMovement) => (
        <div className="flex items-center gap-2">
          {getMovementTypeIcon(movement.movementType)}
          <span>{movement.movementType}</span>
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      sortable: true,
      render: (movement: StockMovement) => (
        <div>
          <div className="font-medium">{movement.materialName}</div>
          <div className="text-sm text-muted-foreground">{movement.materialCode}</div>
        </div>
      ),
    },
    {
      key: "batchNumber",
      header: "Batch",
      sortable: true,
      render: (movement: StockMovement) => movement.batchNumber || "N/A",
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (movement: StockMovement) => (
        <div>
          {movement.quantity} {movement.unit}
        </div>
      ),
    },
    {
      key: "locations",
      header: "From → To",
      sortable: true,
      render: (movement: StockMovement) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          <span>{movement.fromLocationId || "N/A"}</span>
          <ArrowRight className="h-3 w-3 mx-1" />
          <span>{movement.toLocationId || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "reference",
      header: "Reference",
      sortable: true,
      render: (movement: StockMovement) => (
        <div className="text-sm">
          {movement.referenceType && movement.referenceId ? (
            <div>
              <div className="font-medium">{movement.referenceType}</div>
              <div className="text-muted-foreground">#{movement.referenceId}</div>
            </div>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "performedAt",
      header: "Performed At",
      sortable: true,
      render: (movement: StockMovement) => (
        <div className="text-sm">
          {movement.performedAt ? new Date(movement.performedAt).toLocaleString() : "N/A"}
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "movementType",
      label: "Movement Type",
      type: "select" as const,
      options: [
        { value: "Receipt", label: "Receipt" },
        { value: "Transfer", label: "Transfer" },
        { value: "Consumption", label: "Consumption" },
        { value: "Shipment", label: "Shipment" },
        { value: "Adjustment", label: "Adjustment" },
        { value: "Cycle Count", label: "Cycle Count" },
        { value: "Putaway", label: "Putaway" },
        { value: "Picking", label: "Picking" },
      ],
    },
  ]

  const actions = (movement: StockMovement) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/movements/${movement.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/movements/${movement.id}/edit`)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(movement)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const stats = {
    total: movements.length,
    receipts: movements.filter(m => m.movementType === "Receipt").length,
    transfers: movements.filter(m => m.movementType === "Transfer").length,
    consumptions: movements.filter(m => m.movementType === "Consumption").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Movements</h1>
            <p className="text-muted-foreground">Track all stock movements and transfers</p>
          </div>
          <Button onClick={() => router.push("/dashboard/warehouse/movements/new")}>
            <Plus />
            New Movement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receipts</CardTitle>
              <ArrowRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.receipts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transfers</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.transfers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consumptions</CardTitle>
              <ArrowLeft className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.consumptions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Movements Table */}
        <UnifiedDataTable
          data={movements}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search movements..."
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
          onRefresh={fetchMovements}
          onExport={() => console.log("Export movements")}
          emptyMessage="No stock movements found."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Stock Movement"
          description={`Are you sure you want to delete movement ${movementToDelete?.movementNumber}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
