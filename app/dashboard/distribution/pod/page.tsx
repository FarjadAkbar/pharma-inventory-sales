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
  FileText, 
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
  Camera,
  Download,
  Upload,
  Signature
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { ProofOfDelivery, PODFilters } from "@/types/distribution"
import { formatDateISO } from "@/lib/utils"

export default function PODPage() {
  const [pods, setPODs] = useState<ProofOfDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<PODFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchPODs()
  }, [searchQuery, filters, pagination.page])

  const fetchPODs = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProofOfDeliveries({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setPODs(response.data.pods || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch PODs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof PODFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case "Partial":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Partial</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case "Damaged":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Damaged</Badge>
      case "Returned":
        return <Badge className="bg-orange-100 text-orange-800"><RotateCcw className="h-3 w-3 mr-1" />Returned</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "Good":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Good</Badge>
      case "Damaged":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Damaged</Badge>
      case "Compromised":
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Compromised</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (drugName.includes("Capsule")) return <Package className="h-4 w-4" />
    if (drugName.includes("Syrup")) return <Package className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  const calculateStats = () => {
    const total = pods.length
    const delivered = pods.filter(pod => pod.deliveryStatus === "Delivered").length
    const partial = pods.filter(pod => pod.deliveryStatus === "Partial").length
    const rejected = pods.filter(pod => pod.deliveryStatus === "Rejected").length
    const damaged = pods.filter(pod => pod.deliveryStatus === "Damaged").length
    const returned = pods.filter(pod => pod.deliveryStatus === "Returned").length
    const pending = pods.filter(pod => !pod.deliveryDate).length

    return { total, delivered, partial, rejected, damaged, returned, pending }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "podNumber",
      header: "POD #",
      render: (pod: ProofOfDelivery) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {pod.podNumber}
        </div>
      ),
    },
    {
      key: "shipment",
      header: "Shipment",
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="font-medium">{pod.shipmentNumber}</div>
          <div className="text-muted-foreground">SO: {pod.salesOrderNumber}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (pod: ProofOfDelivery) => (
        <div>
          <div className="font-medium">{pod.accountName}</div>
          <div className="text-sm text-muted-foreground">{pod.accountId}</div>
        </div>
      ),
    },
    {
      key: "delivery",
      header: "Delivery",
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {pod.deliveryDate} {pod.deliveryTime}
          </div>
          <div className="text-muted-foreground">
            By: {pod.deliveredByName}
          </div>
        </div>
      ),
    },
    {
      key: "receivedBy",
      header: "Received By",
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="font-medium">{pod.receivedByName}</div>
          <div className="text-muted-foreground">{pod.receivedByTitle}</div>
        </div>
      ),
    },
    {
      key: "deliveryStatus",
      header: "Status",
      render: (pod: ProofOfDelivery) => getDeliveryStatusBadge(pod.deliveryStatus),
    },
    {
      key: "condition",
      header: "Condition",
      render: (pod: ProofOfDelivery) => getConditionBadge(pod.conditionAtDelivery),
    },
    {
      key: "temperature",
      header: "Temperature",
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            {pod.temperatureAtDelivery}°C
          </div>
        </div>
      ),
    },
    {
      key: "signature",
      header: "Signature",
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Signature className="h-3 w-3" />
            {pod.signature ? "Captured" : "Not Captured"}
          </div>
        </div>
      ),
    },
    {
      key: "photos",
      header: "Photos",
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            {pod.photos.length} photos
          </div>
        </div>
      ),
    },
    {
      key: "exceptions",
      header: "Exceptions",
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="font-medium">
            {pod.exceptions.length} exceptions
          </div>
          {pod.exceptions.length > 0 && (
            <div className="text-muted-foreground">
              {pod.exceptions.filter(ex => ex.status === "Open").length} open
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (pod: ProofOfDelivery) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {pod.createdByName}
          </div>
          <div className="text-muted-foreground">
            {formatDateISO(pod.createdAt)}
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
            <h1 className="text-3xl font-bold tracking-tight">Proof of Delivery</h1>
            <p className="text-muted-foreground">Manage delivery confirmations with signature capture and photo documentation</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            New POD
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PODs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partial</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
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
              <CardTitle className="text-sm font-medium">Damaged</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.damaged}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Returned</CardTitle>
              <RotateCcw className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.returned}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search PODs..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Status</label>
                <Select value={filters.deliveryStatus || ""} onValueChange={(value) => handleFilterChange("deliveryStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Customer</label>
                <Select value={filters.accountId || ""} onValueChange={(value) => handleFilterChange("accountId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ziauddin Hospital - Clifton</SelectItem>
                    <SelectItem value="2">Aga Khan University Hospital</SelectItem>
                    <SelectItem value="3">Liaquat National Hospital</SelectItem>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PODs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Proof of Delivery</CardTitle>
            <CardDescription>A comprehensive view of all proof of delivery records with signature capture and photo documentation.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={pods}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search PODs..."
              actions={(pod: ProofOfDelivery) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Upload className="h-4 w-4" />
                  </Button>
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
