"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  RotateCcw, 
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
  MapPin,
  AlertCircle,
  Package,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { MovementRecord, MovementFilters } from "@/types/warehouse"
import { formatDateISO } from "@/lib/utils"
import { InventoryMovementForm } from "@/components/warehouse/inventory-movement-form"
import { toast } from "sonner"

export default function MovementsPage() {
  const [movements, setMovements] = useState<MovementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<MovementFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchMovements()
  }, [searchQuery, filters, pagination.page])

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const response = await apiService.getMovementRecords({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setMovements(response.data.movements || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch movements:", error)
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

  const handleView = (movement: MovementRecord) => {
    // TODO: Implement view functionality
    console.log("View movement:", movement)
  }

  const handleEdit = (movement: MovementRecord) => {
    // TODO: Implement edit functionality
    console.log("Edit movement:", movement)
  }

  const handleDelete = async (movement: MovementRecord) => {
    if (confirm("Are you sure you want to delete this movement record?")) {
      try {
        const response = await apiService.deleteMovementRecord(movement.id)
        if (response.success) {
          toast.success("Movement record deleted successfully")
          fetchMovements()
        } else {
          toast.error("Failed to delete movement record")
        }
      } catch (error) {
        console.error("Error deleting movement record:", error)
        toast.error("An error occurred while deleting the movement record")
      }
    }
  }

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "Receipt":
        return <Badge className="bg-green-100 text-green-800"><ArrowRight className="h-3 w-3 mr-1" />Receipt</Badge>
      case "Transfer":
        return <Badge className="bg-blue-100 text-blue-800"><ArrowUpDown className="h-3 w-3 mr-1" />Transfer</Badge>
      case "Consumption":
        return <Badge className="bg-orange-100 text-orange-800"><ArrowLeft className="h-3 w-3 mr-1" />Consumption</Badge>
      case "Shipment":
        return <Badge className="bg-purple-100 text-purple-800"><ArrowRight className="h-3 w-3 mr-1" />Shipment</Badge>
      case "Adjustment":
        return <Badge className="bg-yellow-100 text-yellow-800"><RotateCcw className="h-3 w-3 mr-1" />Adjustment</Badge>
      case "Cycle Count":
        return <Badge className="bg-gray-100 text-gray-800"><CheckCircle className="h-3 w-3 mr-1" />Cycle Count</Badge>
      case "Putaway":
        return <Badge className="bg-indigo-100 text-indigo-800"><Package className="h-3 w-3 mr-1" />Putaway</Badge>
      case "Picking":
        return <Badge className="bg-pink-100 text-pink-800"><Package className="h-3 w-3 mr-1" />Picking</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "Receipt":
        return <ArrowRight className="h-4 w-4 text-green-600" />
      case "Transfer":
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      case "Consumption":
        return <ArrowLeft className="h-4 w-4 text-orange-600" />
      case "Shipment":
        return <ArrowRight className="h-4 w-4 text-purple-600" />
      case "Adjustment":
        return <RotateCcw className="h-4 w-4 text-yellow-600" />
      case "Cycle Count":
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      case "Putaway":
        return <Package className="h-4 w-4 text-indigo-600" />
      case "Picking":
        return <Package className="h-4 w-4 text-pink-600" />
      default:
        return <RotateCcw className="h-4 w-4 text-gray-600" />
    }
  }

  const getMaterialIcon = (materialName: string) => {
    if (materialName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (materialName.includes("API")) return <AlertCircle className="h-4 w-4" />
    if (materialName.includes("Cellulose")) return <Package className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  const calculateStats = () => {
    const total = movements.length
    const receipts = movements.filter(m => m.movementType === "Receipt").length
    const transfers = movements.filter(m => m.movementType === "Transfer").length
    const consumption = movements.filter(m => m.movementType === "Consumption").length
    const shipments = movements.filter(m => m.movementType === "Shipment").length
    const adjustments = movements.filter(m => m.movementType === "Adjustment").length

    return { total, receipts, transfers, consumption, shipments, adjustments }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "movementNumber",
      header: "Movement #",
      render: (movement: MovementRecord) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {movement.movementNumber}
        </div>
      ),
    },
    {
      key: "movementType",
      header: "Type",
      render: (movement: MovementRecord) => (
        <div className="flex items-center gap-2">
          {getMovementIcon(movement.movementType)}
          {getMovementTypeBadge(movement.movementType)}
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      render: (movement: MovementRecord) => (
        <div>
          <div className="flex items-center gap-2">
            {getMaterialIcon(movement.materialName)}
            <span className="font-medium">{movement.materialName}</span>
          </div>
          <div className="text-sm text-muted-foreground">{movement.materialCode}</div>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      render: (movement: MovementRecord) => (
        <div className="text-sm">
          <div className="font-medium">{movement.batchNumber}</div>
          <div className="text-muted-foreground">{movement.quantity} {movement.unit}</div>
        </div>
      ),
    },
    {
      key: "locations",
      header: "Locations",
      render: (movement: MovementRecord) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            From: {movement.fromLocation}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            To: {movement.toLocation}
          </div>
        </div>
      ),
    },
    {
      key: "zones",
      header: "Zones",
      render: (movement: MovementRecord) => (
        <div className="text-sm">
          <div className="font-medium">{movement.fromZone} → {movement.toZone}</div>
          <div className="text-muted-foreground">
            {movement.fromRack}-{movement.fromShelf}-{movement.fromPosition} → {movement.toRack}-{movement.toShelf}-{movement.toPosition}
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (movement: MovementRecord) => (
        <div className="text-sm">
          <div className="font-medium">{movement.reason}</div>
          {movement.referenceDocument && (
            <div className="text-muted-foreground">
              {movement.referenceDocument}: {movement.referenceNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "performedBy",
      header: "Performed By",
      render: (movement: MovementRecord) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {movement.performedByName}
          </div>
        </div>
      ),
    },
    {
      key: "performedAt",
      header: "Performed At",
      render: (movement: MovementRecord) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(movement.performedAt)}
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
            <h1 className="text-3xl font-bold tracking-tight">Movement History</h1>
            <p className="text-muted-foreground">Track all warehouse movements with complete traceability</p>
          </div>
          <InventoryMovementForm onSuccess={fetchMovements} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
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
              <CardTitle className="text-sm font-medium">Consumption</CardTitle>
              <ArrowLeft className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.consumption}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipments</CardTitle>
              <ArrowRight className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.shipments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
              <RotateCcw className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.adjustments}</div>
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
                    placeholder="Search movements..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Movement Type</label>
                <Select value={filters.movementType || ""} onValueChange={(value) => handleFilterChange("movementType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receipt">Receipt</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Consumption">Consumption</SelectItem>
                    <SelectItem value="Shipment">Shipment</SelectItem>
                    <SelectItem value="Adjustment">Adjustment</SelectItem>
                    <SelectItem value="Cycle Count">Cycle Count</SelectItem>
                    <SelectItem value="Putaway">Putaway</SelectItem>
                    <SelectItem value="Picking">Picking</SelectItem>
                  </SelectContent>
                </Select>
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
                <label className="text-sm font-medium">From Location</label>
                <Select value={filters.fromLocation || ""} onValueChange={(value) => handleFilterChange("fromLocation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receiving Dock A">Receiving Dock A</SelectItem>
                    <SelectItem value="A-01-01-01">A-01-01-01</SelectItem>
                    <SelectItem value="B-02-03-01">B-02-03-01</SelectItem>
                    <SelectItem value="Production Area">Production Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Performed By</label>
                <Select value={filters.performedBy || ""} onValueChange={(value) => handleFilterChange("performedBy", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">Mr. Muhammad Ali</SelectItem>
                    <SelectItem value="9">Ms. Fatima Hassan</SelectItem>
                    <SelectItem value="10">Mr. Ahmed Khan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Movements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Movement Records</CardTitle>
            <CardDescription>A comprehensive view of all warehouse movements with complete traceability and location changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={movements}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search movement records..."
              actions={(movement: MovementRecord) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(movement)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(movement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(movement)}>
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
