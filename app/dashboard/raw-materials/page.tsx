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
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { RawMaterial, RawMaterialFilters } from "@/types/pharma"
import { formatDateISO } from "@/lib/utils"

export default function RawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<RawMaterialFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchRawMaterials()
  }, [searchQuery, filters, pagination.page])

  const fetchRawMaterials = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRawMaterials({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setRawMaterials(response.data.rawMaterials || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch raw materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof RawMaterialFilters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getStockStatus = (current: number, reorderLevel: number) => {
    if (current <= reorderLevel) {
      return { status: "low", color: "text-red-600", icon: TrendingDown }
    } else if (current <= reorderLevel * 1.5) {
      return { status: "medium", color: "text-yellow-600", icon: AlertTriangle }
    } else {
      return { status: "good", color: "text-green-600", icon: CheckCircle }
    }
  }

  const getGradeBadge = (grade: string) => {
    const colors = {
      'USP': 'bg-blue-100 text-blue-800',
      'Pharmaceutical': 'bg-green-100 text-green-800',
      'Food Grade': 'bg-yellow-100 text-yellow-800',
      'Industrial': 'bg-gray-100 text-gray-800',
      'Analytical': 'bg-purple-100 text-purple-800'
    }
    return <Badge className={colors[grade as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{grade}</Badge>
  }

  const calculateStats = () => {
    const total = rawMaterials.length
    const active = rawMaterials.filter(rm => rm.isActive).length
    const lowStock = rawMaterials.filter(rm => rm.currentStock <= rm.reorderLevel).length
    const totalValue = rawMaterials.reduce((sum, rm) => sum + (rm.currentStock * rm.costPerUnit), 0)

    return { total, active, lowStock, totalValue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (rm: RawMaterial) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {rm.code}
        </div>
      ),
    },
    {
      key: "name",
      header: "Material Name",
      render: (rm: RawMaterial) => (
        <div>
          <div className="font-medium">{rm.name}</div>
          <div className="text-sm text-muted-foreground">{rm.specification}</div>
        </div>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (rm: RawMaterial) => getGradeBadge(rm.grade),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (rm: RawMaterial) => (
        <div className="text-sm">
          <div className="font-medium">{rm.supplierName}</div>
          <div className="text-muted-foreground">{rm.unitOfMeasure}</div>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock Level",
      render: (rm: RawMaterial) => {
        const stockStatus = getStockStatus(rm.currentStock, rm.reorderLevel)
        const StockIcon = stockStatus.icon
        return (
          <div className="flex items-center gap-2">
            <StockIcon className={`h-4 w-4 ${stockStatus.color}`} />
            <div>
              <div className="font-medium">{rm.currentStock} {rm.unitOfMeasure}</div>
              <div className="text-xs text-muted-foreground">
                Reorder: {rm.reorderLevel}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: "cost",
      header: "Cost",
      render: (rm: RawMaterial) => (
        <div className="text-sm">
          <div className="font-medium">${rm.costPerUnit.toFixed(2)}</div>
          <div className="text-muted-foreground">
            Total: ${(rm.currentStock * rm.costPerUnit).toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: "shelfLife",
      header: "Shelf Life",
      render: (rm: RawMaterial) => (
        <div className="text-sm">
          {rm.shelfLife ? `${rm.shelfLife} days` : "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (rm: RawMaterial) => (
        <Badge className={rm.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {rm.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raw Materials Management</h1>
            <p className="text-muted-foreground">Manage pharmaceutical raw materials and excipients</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Raw Material
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Materials</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${stats.totalValue.toFixed(2)}</div>
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
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Grade</label>
                <Select value={filters.grade || ""} onValueChange={(value) => handleFilterChange("grade", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USP">USP</SelectItem>
                    <SelectItem value="Pharmaceutical">Pharmaceutical</SelectItem>
                    <SelectItem value="Food Grade">Food Grade</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Analytical">Analytical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Select value={filters.supplierId || ""} onValueChange={(value) => handleFilterChange("supplierId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">MediChem Supplies</SelectItem>
                    <SelectItem value="2">PharmaExcipients Ltd</SelectItem>
                    <SelectItem value="3">Global Pharma Ingredients</SelectItem>
                    <SelectItem value="4">Chemical Solutions Inc</SelectItem>
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

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.lowStock || false}
                  onChange={(e) => handleFilterChange("lowStock", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Show only low stock items</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Raw Materials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Materials List</CardTitle>
            <CardDescription>A comprehensive list of all raw materials and excipients in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={rawMaterials}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search raw materials..."
              actions={(rm: RawMaterial) => (
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
