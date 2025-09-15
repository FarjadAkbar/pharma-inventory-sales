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
  Building2, 
  Search, 
  Filter,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { Supplier, SupplierFilters } from "@/types/pharma"
import { formatDateISO } from "@/lib/utils"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SupplierFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchSuppliers()
  }, [searchQuery, filters, pagination.page])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSuppliers({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setSuppliers(response.data.suppliers || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof SupplierFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ))
  }

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case "average":
        return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
      case "poor":
        return <Badge className="bg-red-100 text-red-800">Poor</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getPerformanceLevel = (supplier: Supplier) => {
    const { onTimeDelivery, qualityScore } = supplier.performance
    if (onTimeDelivery >= 95 && qualityScore >= 4.5) return "excellent"
    if (onTimeDelivery >= 85 && qualityScore >= 4.0) return "good"
    if (onTimeDelivery >= 70 && qualityScore >= 3.0) return "average"
    return "poor"
  }

  const calculateStats = () => {
    const total = suppliers.length
    const active = suppliers.filter(s => s.isActive).length
    const excellent = suppliers.filter(s => getPerformanceLevel(s) === "excellent").length
    const averageRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length

    return { total, active, excellent, averageRating }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (supplier: Supplier) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {supplier.code}
        </div>
      ),
    },
    {
      key: "name",
      header: "Supplier",
      render: (supplier: Supplier) => (
        <div>
          <div className="font-medium">{supplier.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {supplier.address.city}, {supplier.address.country}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (supplier: Supplier) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 mb-1">
            <Phone className="h-3 w-3" />
            {supplier.phone}
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {supplier.email}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-2">
          <div className="flex">{getRatingStars(supplier.rating)}</div>
          <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: "performance",
      header: "Performance",
      render: (supplier: Supplier) => {
        const performance = getPerformanceLevel(supplier)
        return (
          <div>
            {getPerformanceBadge(performance)}
            <div className="text-xs text-muted-foreground mt-1">
              {supplier.performance.onTimeDelivery.toFixed(1)}% on-time
            </div>
          </div>
        )
      },
    },
    {
      key: "orders",
      header: "Orders",
      render: (supplier: Supplier) => (
        <div className="text-sm">
          <div className="font-medium">{supplier.performance.successfulOrders}</div>
          <div className="text-muted-foreground">
            of {supplier.performance.totalOrders} total
          </div>
        </div>
      ),
    },
    {
      key: "delivery",
      header: "Delivery",
      render: (supplier: Supplier) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {supplier.deliveryTime} days
          </div>
          <div className="text-muted-foreground">
            {supplier.paymentTerms}
          </div>
        </div>
      ),
    },
    {
      key: "certifications",
      header: "Certifications",
      render: (supplier: Supplier) => (
        <div className="flex flex-wrap gap-1">
          {supplier.certifications.slice(0, 2).map((cert, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {cert}
            </Badge>
          ))}
          {supplier.certifications.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{supplier.certifications.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (supplier: Supplier) => (
        <Badge className={supplier.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {supplier.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Suppliers Management</h1>
            <p className="text-muted-foreground">Manage pharmaceutical suppliers and their performance</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excellent Performance</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.excellent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <Select value={filters.rating?.toString() || ""} onValueChange={(value) => handleFilterChange("rating", Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Performance</label>
                <Select value={filters.performance || ""} onValueChange={(value) => handleFilterChange("performance", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.isActive?.toString() || ""} onValueChange={(value) => handleFilterChange("isActive", value === "true")}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Suppliers List</CardTitle>
            <CardDescription>A comprehensive list of all pharmaceutical suppliers and their performance metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={suppliers}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search suppliers..."
              actions={(supplier: Supplier) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
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
