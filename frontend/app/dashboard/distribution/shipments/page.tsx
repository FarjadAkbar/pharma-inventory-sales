"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Truck, 
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
  Package,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Thermometer,
  FileText,
  Download
} from "lucide-react"
import { distributionApi } from "@/services/distribution-api.service"
import Link from "next/link"
import { toast } from "sonner"
import type { Shipment, ShipmentFilters } from "@/types/distribution"
import { formatDateISO } from "@/lib/utils"

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<ShipmentFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchShipments()
  }, [searchQuery, filters, pagination.page])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const response = await distributionApi.getShipments({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const data = response.data.data || response.data
        setShipments(Array.isArray(data) ? data : data.shipments || [])
        setPagination(data.pagination || { page: 1, pages: 1, total: data.total || 0 })
      }
    } catch (error) {
      console.error("Failed to fetch shipments:", error)
      toast.error("Failed to fetch shipments")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof ShipmentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (shipment: Shipment) => {
    window.location.href = `/dashboard/distribution/shipments/${shipment.id}`
  }

  const handleEdit = (shipment: Shipment) => {
    console.log("Edit shipment:", shipment)
    // TODO: Implement edit shipment functionality
  }

  const handleProcess = async (shipment: Shipment) => {
    window.location.href = `/dashboard/distribution/shipments/${shipment.id}`
  }

  const handlePack = async (shipment: Shipment) => {
    window.location.href = `/dashboard/distribution/shipments/${shipment.id}`
  }

  const handleGenerateDocs = (shipment: Shipment) => {
    console.log("Generate docs for shipment:", shipment)
    // TODO: Implement generate docs functionality
  }

  const handleDownloadDocs = (shipment: Shipment) => {
    console.log("Download docs for shipment:", shipment)
    // TODO: Implement download docs functionality
  }

  const handleDelete = async (shipment: Shipment) => {
    if (window.confirm("Are you sure you want to delete this shipment?")) {
      try {
        const response = await distributionApi.deleteShipment(shipment.id)
        
        if (response.success) {
          toast.success("Shipment deleted successfully")
          fetchShipments()
        } else {
          toast.error("Failed to delete shipment")
        }
      } catch (error) {
        console.error("Error deleting shipment:", error)
        toast.error("Failed to delete shipment")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case "In Transit":
        return <Badge className="bg-blue-100 text-blue-800"><Truck className="h-3 w-3 mr-1" />In Transit</Badge>
      case "Shipped":
        return <Badge className="bg-purple-100 text-purple-800"><Package className="h-3 w-3 mr-1" />Shipped</Badge>
      case "Packed":
        return <Badge className="bg-indigo-100 text-indigo-800"><Package className="h-3 w-3 mr-1" />Packed</Badge>
      case "Picked":
        return <Badge className="bg-orange-100 text-orange-800"><CheckCircle className="h-3 w-3 mr-1" />Picked</Badge>
      case "In Progress":
        return <Badge className="bg-yellow-100 text-yellow-800"><Play className="h-3 w-3 mr-1" />In Progress</Badge>
      case "Pending":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800"><Edit className="h-3 w-3 mr-1" />Draft</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case "Returned":
        return <Badge className="bg-red-100 text-red-800"><RotateCcw className="h-3 w-3 mr-1" />Returned</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Emergency":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Emergency</Badge>
      case "Urgent":
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />Urgent</Badge>
      case "High":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />High</Badge>
      case "Normal":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Normal</Badge>
      case "Low":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
    }
  }

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (drugName.includes("Capsule")) return <Package className="h-4 w-4" />
    if (drugName.includes("Syrup")) return <Package className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  const calculateStats = () => {
    const total = shipments.length
    const pending = shipments.filter(shipment => shipment.status === "Pending").length
    const inProgress = shipments.filter(shipment => shipment.status === "In Progress").length
    const picked = shipments.filter(shipment => shipment.status === "Picked").length
    const packed = shipments.filter(shipment => shipment.status === "Packed").length
    const shipped = shipments.filter(shipment => shipment.status === "Shipped").length
    const inTransit = shipments.filter(shipment => shipment.status === "In Transit").length
    const delivered = shipments.filter(shipment => shipment.status === "Delivered").length

    return { total, pending, inProgress, picked, packed, shipped, inTransit, delivered }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "shipmentNumber",
      header: "Shipment #",
      sortable: true,
      render: (shipment: Shipment) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {shipment.shipmentNumber}
        </div>
      ),
    },
    {
      key: "salesOrder",
      header: "Sales Order",
      sortable: true,
      render: (shipment: Shipment) => (
        <div className="text-sm">
          <div className="font-medium">{shipment.salesOrderNumber}</div>
          <div className="text-muted-foreground">ID: {shipment.salesOrderId}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      render: (shipment: Shipment) => (
        <div>
          <div className="font-medium">{shipment.accountName}</div>
          <div className="text-sm text-muted-foreground">{shipment.accountId}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      sortable: true,
      render: (shipment: Shipment) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{shipment.items.length} items</div>
          <div className="text-xs text-muted-foreground">
            {shipment.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} units
          </div>
        </div>
      ),
    },
    {
      key: "carrier",
      header: "Carrier",
      sortable: true,
      render: (shipment: Shipment) => (
        <div className="text-sm">
          <div className="font-medium">{shipment.carrier}</div>
          <div className="text-muted-foreground">{shipment.serviceType}</div>
          {shipment.trackingNumber && (
            <div className="text-xs text-blue-600 font-mono">
              {shipment.trackingNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (shipment: Shipment) => getPriorityBadge(shipment.priority),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (shipment: Shipment) => getStatusBadge(shipment.status),
    },
    {
      key: "temperature",
      header: "Temperature",
      sortable: true,
      render: (shipment: Shipment) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            {shipment.temperatureRequirements?.minTemperature}°C - {shipment.temperatureRequirements?.maxTemperature}°C
          </div>
          <div className="text-muted-foreground">
            {shipment.temperatureRequirements?.monitoringRequired ? "Monitoring" : "No Monitoring"}
          </div>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      sortable: true,
      render: (shipment: Shipment) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Ship: {formatDateISO(shipment.shipmentDate)}
          </div>
          <div className="text-muted-foreground">
            Expected: {formatDateISO(shipment.expectedDeliveryDate)}
          </div>
          {shipment.actualDeliveryDate && (
            <div className="text-muted-foreground">
              Delivered: {formatDateISO(shipment.actualDeliveryDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "shipping",
      header: "Shipping",
      sortable: true,
      render: (shipment: Shipment) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {shipment.shippingAddress.city}
          </div>
          <div className="text-muted-foreground">
            {shipment.shippingAddress.state}
          </div>
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Draft", label: "Draft" },
        { value: "Pending", label: "Pending" },
        { value: "In Progress", label: "In Progress" },
        { value: "Picked", label: "Picked" },
        { value: "Packed", label: "Packed" },
        { value: "Shipped", label: "Shipped" },
        { value: "In Transit", label: "In Transit" },
        { value: "Delivered", label: "Delivered" },
        { value: "Returned", label: "Returned" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select" as const,
      options: [
        { value: "Low", label: "Low" },
        { value: "Normal", label: "Normal" },
        { value: "High", label: "High" },
        { value: "Urgent", label: "Urgent" },
        { value: "Emergency", label: "Emergency" },
      ],
    },
    {
      key: "carrier",
      label: "Carrier",
      type: "select" as const,
      options: [
        { value: "Express Logistics", label: "Express Logistics" },
        { value: "Fast Track", label: "Fast Track" },
        { value: "Reliable Transport", label: "Reliable Transport" },
      ],
    },
  ]

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const actions = (shipment: Shipment) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => handleView(shipment)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleEdit(shipment)}>
        <Edit className="h-4 w-4" />
      </Button>
      {(shipment.status === "Draft" || shipment.status === "Pending" || shipment.status === "Allocated" || shipment.status === "Picked" || shipment.status === "Packed") && (
        <Button variant="ghost" size="sm" onClick={() => handleView(shipment)}>
          <Play className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => handleGenerateDocs(shipment)}>
        <FileText className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleDownloadDocs(shipment)}>
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipment Management</h1>
            <p className="text-muted-foreground">Manage shipments with FEFO allocation and pick list generation</p>
          </div>
          <Link href="/dashboard/distribution/shipments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Plan Shipment
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Picked</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.picked}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Packed</CardTitle>
              <Package className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.packed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        {/* Shipments Table */}
        <UnifiedDataTable
          data={shipments}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search shipments..."
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
          onRefresh={fetchShipments}
          onExport={() => console.log("Export shipments")}
          emptyMessage="No shipments found. Create your first shipment to get started."
        />
      </div>
    </DashboardLayout>
  )
}
