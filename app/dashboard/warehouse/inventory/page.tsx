"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Package, 
  Search, 
  Filter,
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
import { apiService } from "@/services/api.service"
import type { InventoryItem, InventoryFilters } from "@/types/warehouse"
import { formatDateISO } from "@/lib/utils"

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<InventoryFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchInventoryItems()
  }, [searchQuery, filters, pagination.page])

  const fetchInventoryItems = async () => {
    try {
      setLoading(true)
      const response = await apiService.getInventoryItems({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setInventoryItems(response.data.inventoryItems || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch inventory items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof InventoryFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
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
      render: (item: InventoryItem) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {item.itemCode}
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
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
      render: (item: InventoryItem) => (
        <div className="text-sm">
          <div className="font-medium">{item.quantity.toLocaleString()} {item.unit}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (item: InventoryItem) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
          <div className="text-muted-foreground">Zone {item.zone}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: InventoryItem) => getStatusBadge(item.status),
    },
    {
      key: "conditions",
      header: "Conditions",
      render: (item: InventoryItem) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            {item.temperature}°C
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            {item.humidity}%
          </div>
        </div>
      ),
    },
    {
      key: "expiry",
      header: "Expiry Status",
      render: (item: InventoryItem) => {
        const expiryStatus = getExpiryStatus(item.expiryDate)
        return (
          <div className={`text-sm ${expiryStatus.color}`}>
            {expiryStatus.status}
          </div>
        )
      },
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      render: (item: InventoryItem) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {item.lastUpdatedByName}
          </div>
          <div className="text-muted-foreground">
            {formatDateISO(item.lastUpdated)}
          </div>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">Manage warehouse inventory with FEFO display and location mapping</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Material</label>
                <Select value={filters.materialId || ""} onValueChange={(value) => handleFilterChange("materialId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Materials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Paracetamol API</SelectItem>
                    <SelectItem value="2">Microcrystalline Cellulose</SelectItem>
                    <SelectItem value="3">Sodium Starch Glycolate</SelectItem>
                    <SelectItem value="4">Paracetamol Tablets</SelectItem>
                    <SelectItem value="5">Ibuprofen Tablets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status || ""} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Quarantine">Quarantine</SelectItem>
                    <SelectItem value="Hold">Hold</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Zone</label>
                <Select value={filters.zone || ""} onValueChange={(value) => handleFilterChange("zone", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Zone A (Raw Materials)</SelectItem>
                    <SelectItem value="B">Zone B (Finished Goods)</SelectItem>
                    <SelectItem value="C">Zone C (Quarantine)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry From</label>
                <Input
                  type="date"
                  value={filters.expiryDateFrom || ""}
                  onChange={(e) => handleFilterChange("expiryDateFrom", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry To</label>
                <Input
                  type="date"
                  value={filters.expiryDateTo || ""}
                  onChange={(e) => handleFilterChange("expiryDateTo", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>A comprehensive view of all warehouse inventory items with FEFO display and location mapping.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={inventoryItems}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search inventory items..."
              actions={(item: InventoryItem) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {item.status === "Available" && (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
