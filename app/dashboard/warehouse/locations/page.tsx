"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MapPin, Package, AlertTriangle, CheckCircle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface WarehouseLocation {
  id: string
  name: string
  code: string
  type: "zone" | "aisle" | "rack" | "shelf" | "bin" | "floor"
  siteId: string
  siteName: string
  parentLocationId?: string
  parentLocationName?: string
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
  accessLevel: "public" | "restricted" | "secure"
  isActive: boolean
  isFull: boolean
  currentUtilization: number
  itemsCount: number
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

export default function WarehouseLocationsPage() {
  const [locations, setLocations] = useState<WarehouseLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    fetchLocations()
  }, [searchQuery, pagination.page, typeFilter])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await apiService.getWarehouseLocations({
        search: searchQuery,
        type: typeFilter !== "all" ? typeFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const locationData = response.data as {
          locations: WarehouseLocation[]
          pagination: { page: number; pages: number; total: number }
        }
        setLocations(locationData.locations || [])
        setPagination(locationData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch warehouse locations:", error)
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

  const handleEdit = (location: WarehouseLocation) => {
    window.location.href = `/dashboard/warehouse/locations/${location.id}`
  }

  const handleDelete = async (location: WarehouseLocation) => {
    if (confirm(`Are you sure you want to delete warehouse location "${location.name}"?`)) {
      try {
        await apiService.deleteWarehouseLocation(location.id)
        fetchLocations()
      } catch (error) {
        console.error("Failed to delete warehouse location:", error)
      }
    }
  }

  const handleToggleStatus = async (location: WarehouseLocation) => {
    try {
      await apiService.updateWarehouseLocation(location.id, { isActive: !location.isActive })
      fetchLocations()
    } catch (error) {
      console.error("Failed to toggle warehouse location status:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "zone":
        return "bg-blue-100 text-blue-800"
      case "aisle":
        return "bg-green-100 text-green-800"
      case "rack":
        return "bg-purple-100 text-purple-800"
      case "shelf":
        return "bg-orange-100 text-orange-800"
      case "bin":
        return "bg-yellow-100 text-yellow-800"
      case "floor":
        return "bg-gray-100 text-gray-800"
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

  const calculateStats = () => {
    const activeLocations = locations.filter(l => l.isActive).length
    const fullLocations = locations.filter(l => l.isFull).length
    const totalItems = locations.reduce((sum, l) => sum + l.itemsCount, 0)
    const avgUtilization = locations.length > 0 
      ? (locations.reduce((sum, l) => sum + l.currentUtilization, 0) / locations.length).toFixed(1)
      : "0.0"

    return { activeLocations, fullLocations, totalItems, avgUtilization }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Location",
      render: (location: WarehouseLocation) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
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
      render: (location: WarehouseLocation) => (
        <Badge className={getTypeBadgeColor(location.type)}>
          {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "site",
      header: "Site",
      render: (location: WarehouseLocation) => (
        <div className="text-sm">
          <div className="font-medium">{location.siteName}</div>
          <div className="text-muted-foreground">{location.parentLocationName || "Root Location"}</div>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      render: (location: WarehouseLocation) => (
        <div className="space-y-1 text-sm">
          <div>Volume: {location.capacity.volume} {location.capacity.unit}</div>
          <div>Weight: {location.capacity.weight} kg</div>
        </div>
      ),
    },
    {
      key: "utilization",
      header: "Utilization",
      render: (location: WarehouseLocation) => (
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
      key: "items",
      header: "Items",
      render: (location: WarehouseLocation) => (
        <div className="text-sm">
          <div className="font-medium">{location.itemsCount} items</div>
          <div className="text-muted-foreground">Last updated: {formatDateISO(location.lastUpdated)}</div>
        </div>
      ),
    },
    {
      key: "accessLevel",
      header: "Access",
      render: (location: WarehouseLocation) => (
        <Badge className={getAccessLevelBadgeColor(location.accessLevel)}>
          {location.accessLevel.charAt(0).toUpperCase() + location.accessLevel.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (location: WarehouseLocation) => (
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouse Locations</h1>
            <p className="text-muted-foreground">Manage warehouse storage locations and capacity</p>
          </div>

          <PermissionGuard module="WAREHOUSE" screen="locations" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/warehouse/locations/new")}>
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
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Type Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Type</CardTitle>
            <CardDescription>Select a location type to filter results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Types" },
                { value: "zone", label: "Zone" },
                { value: "aisle", label: "Aisle" },
                { value: "rack", label: "Rack" },
                { value: "shelf", label: "Shelf" },
                { value: "bin", label: "Bin" },
                { value: "floor", label: "Floor" },
              ].map((type) => (
                <Button
                  key={type.value}
                  variant={typeFilter === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Locations Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Warehouse Locations</CardTitle>
            <CardDescription>A list of all warehouse locations with their capacity and utilization.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={locations}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search locations..."
              actions={(location: WarehouseLocation) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="WAREHOUSE" screen="locations" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="WAREHOUSE" screen="locations" action="update">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleStatus(location)}
                    >
                      {location.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="WAREHOUSE" screen="locations" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(location)}>
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
