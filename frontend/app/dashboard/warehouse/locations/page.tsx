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
  MapPin, 
  Package, 
  CheckCircle,
  XCircle,
  Wrench,
  Eye,
  Edit,
  Trash2,
  Thermometer,
  Droplets,
  Building2
} from "lucide-react"
import { warehouseApi } from "@/services"
import type { StorageLocation } from "@/types/warehouse"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function StorageLocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<StorageLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ warehouseId?: number; status?: string; type?: string }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<StorageLocation | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [searchQuery, filters, pagination.page])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getStorageLocations({
        ...filters,
      })
      
      if (response && Array.isArray(response)) {
        setLocations(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch storage locations:", error)
      toast.error("Failed to load storage locations")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination({ ...pagination, page: 1 })
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { warehouseId?: number; status?: string; type?: string })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleDelete = (location: StorageLocation) => {
    setLocationToDelete(location)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return

    try {
      await warehouseApi.deleteStorageLocation(locationToDelete.id.toString())
      toast.success("Storage location deleted successfully")
      fetchLocations()
      setDeleteDialogOpen(false)
      setLocationToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete storage location")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Available: "default",
      Occupied: "secondary",
      Reserved: "outline",
      Blocked: "destructive",
      Maintenance: "outline",
    }
    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    )
  }

  const columns = [
    {
      header: "Location Code",
      accessorKey: "locationCode",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.locationCode}</div>
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: any) => getStatusBadge(row.original.status),
    },
    {
      header: "Zone/Aisle",
      accessorKey: "zone",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.zone && <div>Zone: {row.original.zone}</div>}
          {row.original.aisle && <div>Aisle: {row.original.aisle}</div>}
          {!row.original.zone && !row.original.aisle && <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      header: "Rack/Shelf/Position",
      accessorKey: "rack",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.rack && <div>Rack: {row.original.rack}</div>}
          {row.original.shelf && <div>Shelf: {row.original.shelf}</div>}
          {row.original.position && <div>Pos: {row.original.position}</div>}
          {!row.original.rack && !row.original.shelf && <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      header: "Temperature",
      accessorKey: "temperature",
      cell: ({ row }: any) => {
        if (row.original.minTemperature && row.original.maxTemperature) {
          return (
            <div className="flex items-center gap-1 text-sm">
              <Thermometer className="h-3 w-3" />
              {row.original.minTemperature}°C - {row.original.maxTemperature}°C
            </div>
          )
        }
        return <span className="text-muted-foreground">N/A</span>
      },
    },
    {
      header: "Capacity",
      accessorKey: "capacity",
      cell: ({ row }: any) => {
        if (row.original.capacity) {
          return (
            <div className="text-sm">
              {row.original.capacity} {row.original.capacityUnit || ""}
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
        { value: "Available", label: "Available" },
        { value: "Occupied", label: "Occupied" },
        { value: "Reserved", label: "Reserved" },
        { value: "Blocked", label: "Blocked" },
        { value: "Maintenance", label: "Maintenance" },
      ],
    },
    {
      key: "type",
      label: "Type",
      type: "select" as const,
      options: [
        { value: "Bin", label: "Bin" },
        { value: "Rack", label: "Rack" },
        { value: "Shelf", label: "Shelf" },
        { value: "Pallet", label: "Pallet" },
        { value: "Bulk", label: "Bulk" },
        { value: "Cold Room", label: "Cold Room" },
        { value: "Freezer", label: "Freezer" },
      ],
    },
  ]

  const actions = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (location: StorageLocation) => router.push(`/dashboard/warehouse/locations/${location.id}`),
      variant: "ghost" as const,
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (location: StorageLocation) => router.push(`/dashboard/warehouse/locations/${location.id}/edit`),
      variant: "ghost" as const,
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "ghost" as const,
    },
  ]

  const stats = {
    total: locations.length,
    available: locations.filter(l => l.status === "Available").length,
    occupied: locations.filter(l => l.status === "Occupied").length,
    reserved: locations.filter(l => l.status === "Reserved").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Storage Locations</h1>
            <p className="text-muted-foreground">Manage warehouse storage locations and zones</p>
          </div>
          <Button onClick={() => router.push("/dashboard/warehouse/locations/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <MapPin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
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
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.occupied}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reserved</CardTitle>
              <XCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Locations Table */}
        <UnifiedDataTable
          data={locations}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search locations..."
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
          onRefresh={fetchLocations}
          onExport={() => console.log("Export locations")}
          emptyMessage="No storage locations found. Add your first location to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Storage Location"
          description={`Are you sure you want to delete location ${locationToDelete?.locationCode}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
