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
  Building2,
  CheckCircle,
  XCircle,
  Wrench,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Thermometer,
  Droplets
} from "lucide-react"
import { warehouseApi } from "@/services"
import type { Warehouse } from "@/types/warehouse"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function WarehousesPage() {
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ status?: string; type?: string }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null)

  useEffect(() => {
    fetchWarehouses()
  }, [searchQuery, filters, pagination.page])

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getWarehouses({
        ...filters,
      })
      
      if (response && Array.isArray(response)) {
        setWarehouses(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error)
      toast.error("Failed to load warehouses")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination({ ...pagination, page: 1 })
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { status?: string; type?: string })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleDelete = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!warehouseToDelete) return

    try {
      await warehouseApi.deleteWarehouse(warehouseToDelete.id.toString())
      toast.success("Warehouse deleted successfully")
      fetchWarehouses()
      setDeleteDialogOpen(false)
      setWarehouseToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete warehouse")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Active: "default",
      Inactive: "secondary",
      Maintenance: "outline",
    }
    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Cold Storage":
        return <Thermometer className="h-4 w-4" />
      case "Quarantine":
        return <XCircle className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const columns = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (warehouse: Warehouse) => (
        <div className="font-medium">{warehouse.code}</div>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (warehouse: Warehouse) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(warehouse.type)}
          <span>{warehouse.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (warehouse: Warehouse) => warehouse.type,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (warehouse: Warehouse) => getStatusBadge(warehouse.status),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (warehouse: Warehouse) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {warehouse.city || "N/A"}
          {warehouse.state && `, ${warehouse.state}`}
        </div>
      ),
    },
    {
      key: "temperature",
      header: "Temperature",
      sortable: true,
      render: (warehouse: Warehouse) => {
        if (warehouse.minTemperature && warehouse.maxTemperature) {
          return (
            <div className="flex items-center gap-1 text-sm">
              <Thermometer className="h-3 w-3" />
              {warehouse.minTemperature}°C - {warehouse.maxTemperature}°C
            </div>
          )
        }
        return <span className="text-muted-foreground">N/A</span>
      },
    },
  ]

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
        { value: "Maintenance", label: "Maintenance" },
      ],
    },
    {
      key: "type",
      label: "Type",
      type: "select" as const,
      options: [
        { value: "Main", label: "Main" },
        { value: "Distribution", label: "Distribution" },
        { value: "Cold Storage", label: "Cold Storage" },
        { value: "Quarantine", label: "Quarantine" },
        { value: "Hold", label: "Hold" },
      ],
    },
  ]

  const actions = (warehouse: Warehouse) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/warehouses/${warehouse.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/warehouses/${warehouse.id}/edit`)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(warehouse)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const stats = {
    total: warehouses.length,
    active: warehouses.filter(w => w.status === "Active").length,
    inactive: warehouses.filter(w => w.status === "Inactive").length,
    maintenance: warehouses.filter(w => w.status === "Maintenance").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warehouses</h1>
            <p className="text-muted-foreground">Manage warehouse facilities and locations</p>
          </div>
          <Button onClick={() => router.push("/dashboard/warehouse/warehouses/new")}>
            <Plus />
            Add Warehouse
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
            </CardContent>
          </Card>
        </div>

        {/* Warehouses Table */}
        <UnifiedDataTable
          data={warehouses}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search warehouses..."
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
          onRefresh={fetchWarehouses}
          onExport={() => console.log("Export warehouses")}
          emptyMessage="No warehouses found. Add your first warehouse to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Warehouse"
          description={`Are you sure you want to delete warehouse ${warehouseToDelete?.code}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}

