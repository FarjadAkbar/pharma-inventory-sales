"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Store, MapPin, Thermometer, Package, AlertTriangle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface StorageLocation {
  id: string
  name: string
  code: string
  type: "room" | "rack" | "shelf" | "bin" | "freezer" | "refrigerator"
  siteId: string
  siteName: string
  parentLocationId?: string
  parentLocationName?: string
  temperature: {
    min: number
    max: number
    current: number
    unit: "celsius" | "fahrenheit"
  }
  humidity: {
    min: number
    max: number
    current: number
  }
  capacity: {
    volume: number
    weight: number
    unit: string
  }
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  }
  accessLevel: "public" | "restricted" | "secure"
  isActive: boolean
  isFull: boolean
  currentUtilization: number
  createdAt: string
  updatedAt: string
}

export default function StorageLocationsPage() {
  const [locations, setLocations] = useState<StorageLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchLocations()
  }, [searchQuery, pagination.page, filters])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await apiService.getStorageLocations({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const locationData = response.data as {
          locations: StorageLocation[]
          pagination: { page: number; pages: number; total: number }
        }
        setLocations(locationData.locations || [])
        setPagination(locationData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch storage locations:", error)
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

  const handleEdit = (location: StorageLocation) => {
    window.location.href = `/dashboard/storage-locations/${location.id}`
  }

  const handleDelete = async (location: StorageLocation) => {
    if (confirm(`Are you sure you want to delete storage location "${location.name}"?`)) {
      try {
        await apiService.deleteStorageLocation(location.id)
        fetchLocations()
      } catch (error) {
        console.error("Failed to delete storage location:", error)
      }
    }
  }

  const handleToggleStatus = async (location: StorageLocation) => {
    try {
      await apiService.updateStorageLocation(location.id, { isActive: !location.isActive })
      fetchLocations()
    } catch (error) {
      console.error("Failed to toggle storage location status:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "room":
        return "bg-blue-100 text-blue-800"
      case "rack":
        return "bg-green-100 text-green-800"
      case "shelf":
        return "bg-purple-100 text-purple-800"
      case "bin":
        return "bg-orange-100 text-orange-800"
      case "freezer":
        return "bg-cyan-100 text-cyan-800"
      case "refrigerator":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAccessLevelBadgeColor = (level: string) => {
    switch (level) {
      case "public":
        return "bg-green-100 text-green-800"
      case "restricted":
        return "bg-yellow-100 text-yellow-800"
      case "secure":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTemperatureStatus = (location: StorageLocation) => {
    const { current, min, max } = location.temperature
    if (current < min || current > max) {
      return "out_of_range"
    }
    if (current <= min + 2 || current >= max - 2) {
      return "near_limit"
    }
    return "normal"
  }

  const getTemperatureStatusColor = (status: string) => {
    switch (status) {
      case "out_of_range":
        return "text-red-600"
      case "near_limit":
        return "text-yellow-600"
      case "normal":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const calculateStats = () => {
    const activeLocations = locations.filter(l => l.isActive).length
    const fullLocations = locations.filter(l => l.isFull).length
    const temperatureAlerts = locations.filter(l => getTemperatureStatus(l) === "out_of_range").length
    const avgUtilization = locations.length > 0 
      ? (locations.reduce((sum, l) => sum + l.currentUtilization, 0) / locations.length).toFixed(1)
      : "0.0"

    return { activeLocations, fullLocations, temperatureAlerts, avgUtilization }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Location",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{location.name}</div>
            <div className="text-sm text-muted-foreground">{location.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (location: StorageLocation) => (
        <Badge className={getTypeBadgeColor(location.type)}>
          {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "site",
      header: "Site",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{location.siteName}</span>
        </div>
      ),
    },
    {
      key: "temperature",
      header: "Temperature",
      sortable: true,
      render: (location: StorageLocation) => {
        const status = getTemperatureStatus(location)
        return (
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <span className={getTemperatureStatusColor(status)}>
              {location.temperature.current}°{location.temperature.unit.charAt(0).toUpperCase()}
            </span>
            {status === "out_of_range" && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
          </div>
        )
      },
    },
    {
      key: "capacity",
      header: "Capacity",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="space-y-1 text-sm">
          <div>Volume: {location.capacity.volume} {location.capacity.unit}</div>
          <div>Weight: {location.capacity.weight} kg</div>
        </div>
      ),
    },
    {
      key: "utilization",
      header: "Utilization",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{location.currentUtilization}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                location.currentUtilization > 90 ? "bg-red-500" :
                location.currentUtilization > 70 ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(location.currentUtilization, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "accessLevel",
      header: "Access",
      sortable: true,
      render: (location: StorageLocation) => (
        <Badge className={getAccessLevelBadgeColor(location.accessLevel)}>
          {location.accessLevel.charAt(0).toUpperCase() + location.accessLevel.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (location: StorageLocation) => (
        <div className="space-y-1">
          <Badge variant={location.isActive ? "default" : "secondary"}>
            {location.isActive ? "Active" : "Inactive"}
          </Badge>
          {location.isFull && (
            <Badge variant="destructive" className="text-xs">
              Full
            </Badge>
          )}
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "type",
      label: "Type",
      type: "select" as const,
      options: [
        { value: "room", label: "Room" },
        { value: "rack", label: "Rack" },
        { value: "shelf", label: "Shelf" },
        { value: "bin", label: "Bin" },
        { value: "freezer", label: "Freezer" },
        { value: "refrigerator", label: "Refrigerator" },
      ],
    },
    {
      key: "siteId",
      label: "Site",
      type: "select" as const,
      options: [
        { value: "1", label: "Main Manufacturing Plant" },
        { value: "2", label: "Central Warehouse" },
        { value: "3", label: "Distribution Center" },
        { value: "4", label: "Quality Lab" },
      ],
    },
    {
      key: "isActive",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ]

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const actions = (location: StorageLocation) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="MASTER_DATA" screen="storage_locations" action="update">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
          Edit
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="storage_locations" action="update">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleToggleStatus(location)}
        >
          {location.isActive ? "Deactivate" : "Activate"}
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="storage_locations" action="delete">
        <Button variant="ghost" size="sm" onClick={() => handleDelete(location)}>
          Delete
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Storage Locations</h1>
            <p className="text-muted-foreground">Manage warehouse storage locations and conditions</p>
          </div>

          <PermissionGuard module="MASTER_DATA" screen="storage_locations" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/storage-locations/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeLocations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full Locations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.fullLocations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.avgUtilization}%</div>
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
          onExport={() => console.log("Export storage locations")}
          emptyMessage="No storage locations found. Add your first location to get started."
        />
      </div>
    </DashboardLayout>
  )
}
