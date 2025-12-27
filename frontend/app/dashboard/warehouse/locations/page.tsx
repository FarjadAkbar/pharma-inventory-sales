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
      
      console.log("Storage locations response:", response)
      
      if (response && Array.isArray(response)) {
        setLocations(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      } else if (response && response.data && Array.isArray(response.data)) {
        // Handle paginated response
        setLocations(response.data)
        setPagination({
          page: response.pagination?.page || 1,
          pages: response.pagination?.pages || 1,
          total: response.pagination?.total || response.data.length
        })
      } else {
        console.warn("Unexpected response format:", response)
        setLocations([])
        setPagination({ page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch storage locations:", error)
      toast.error("Failed to load storage locations")
      setLocations([])
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
      key: "locationCode",
      header: "Location Code",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="font-medium">{location.locationCode}</div>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{location.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (location: StorageLocation) => location.type,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (location: StorageLocation) => getStatusBadge(location.status),
    },
    {
      key: "zone",
      header: "Zone/Aisle",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="text-sm">
          {location.zone && <div>Zone: {location.zone}</div>}
          {location.aisle && <div>Aisle: {location.aisle}</div>}
          {!location.zone && !location.aisle && <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      key: "rack",
      header: "Rack/Shelf/Position",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="text-sm">
          {location.rack && <div>Rack: {location.rack}</div>}
          {location.shelf && <div>Shelf: {location.shelf}</div>}
          {location.position && <div>Pos: {location.position}</div>}
          {!location.rack && !location.shelf && <span className="text-muted-foreground">N/A</span>}
        </div>
      ),
    },
    {
      key: "temperature",
      header: "Temperature",
      sortable: true,
      render: (location: StorageLocation) => {
        if (location.minTemperature && location.maxTemperature) {
          return (
            <div className="flex items-center gap-1 text-sm">
              <Thermometer className="h-3 w-3" />
              {location.minTemperature}°C - {location.maxTemperature}°C
            </div>
          )
        }
        return <span className="text-muted-foreground">N/A</span>
      },
    },
    {
      key: "capacity",
      header: "Capacity",
      sortable: true,
      render: (location: StorageLocation) => {
        if (location.capacity) {
          return (
            <div className="text-sm">
              {location.capacity} {location.capacityUnit || ""}
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

  const actions = (location: StorageLocation) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/locations/${location.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/locations/${location.id}/edit`)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(location)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

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
            <Plus  />
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
