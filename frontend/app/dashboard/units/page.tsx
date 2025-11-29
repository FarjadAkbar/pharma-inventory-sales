"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, Calculator, Scale, Ruler } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Unit {
  id: string
  name: string
  code: string
  symbol: string
  category: "weight" | "volume" | "length" | "area" | "temperature" | "pressure" | "time" | "count"
  baseUnit: boolean
  conversionFactor: number
  baseUnitId?: string
  baseUnitName?: string
  precision: number
  isActive: boolean
  description: string
  createdAt: string
  updatedAt: string
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchUnits()
  }, [searchQuery, pagination.page, categoryFilter])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUnits({
        search: searchQuery,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const unitData = response.data as {
          units: Unit[]
          pagination: { page: number; pages: number; total: number }
        }
        setUnits(unitData.units || [])
        setPagination(unitData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch units:", error)
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

  const handleEdit = (unit: Unit) => {
    window.location.href = `/dashboard/units/${unit.id}`
  }

  const handleDelete = async (unit: Unit) => {
    if (confirm(`Are you sure you want to delete unit "${unit.name}"?`)) {
      try {
        await apiService.deleteUnit(unit.id)
        fetchUnits()
      } catch (error) {
        console.error("Failed to delete unit:", error)
      }
    }
  }

  const handleToggleStatus = async (unit: Unit) => {
    try {
      await apiService.updateUnit(unit.id, { isActive: !unit.isActive })
      fetchUnits()
    } catch (error) {
      console.error("Failed to toggle unit status:", error)
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "weight":
        return "bg-blue-100 text-blue-800"
      case "volume":
        return "bg-green-100 text-green-800"
      case "length":
        return "bg-purple-100 text-purple-800"
      case "area":
        return "bg-orange-100 text-orange-800"
      case "temperature":
        return "bg-red-100 text-red-800"
      case "pressure":
        return "bg-yellow-100 text-yellow-800"
      case "time":
        return "bg-teal-100 text-teal-800"
      case "count":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "weight":
        return <Scale className="h-4 w-4" />
      case "volume":
        return <Package className="h-4 w-4" />
      case "length":
        return <Ruler className="h-4 w-4" />
      case "area":
        return <Calculator className="h-4 w-4" />
      case "temperature":
        return <Package className="h-4 w-4" />
      case "pressure":
        return <Package className="h-4 w-4" />
      case "time":
        return <Package className="h-4 w-4" />
      case "count":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const calculateStats = () => {
    const activeUnits = units.filter(u => u.isActive).length
    const baseUnits = units.filter(u => u.baseUnit).length
    const categories = [...new Set(units.map(u => u.category))].length
    const totalConversions = units.filter(u => !u.baseUnit).length

    return { activeUnits, baseUnits, categories, totalConversions }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Unit",
      render: (unit: Unit) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {getCategoryIcon(unit.category)}
          </div>
          <div>
            <div className="font-medium">{unit.name}</div>
            <div className="text-sm text-muted-foreground">{unit.code} ({unit.symbol})</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (unit: Unit) => (
        <Badge className={getCategoryBadgeColor(unit.category)}>
          {unit.category.charAt(0).toUpperCase() + unit.category.slice(1)}
        </Badge>
      ),
    },
    {
      key: "conversion",
      header: "Conversion",
      render: (unit: Unit) => (
        <div className="text-sm">
          {unit.baseUnit ? (
            <Badge variant="secondary">Base Unit</Badge>
          ) : (
            <div>
              <div>Factor: {unit.conversionFactor}</div>
              <div className="text-muted-foreground">Base: {unit.baseUnitName}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "precision",
      header: "Precision",
      render: (unit: Unit) => (
        <span className="text-sm font-mono">{unit.precision} decimal places</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (unit: Unit) => (
        <span className="text-sm text-muted-foreground">{unit.description}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (unit: Unit) => (
        <Badge variant={unit.isActive ? "default" : "secondary"}>
          {unit.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Units of Measure</h1>
            <p className="text-muted-foreground">Manage units of measure and conversion factors</p>
          </div>

          <PermissionGuard module="MASTER_DATA" screen="units" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/units/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Units</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeUnits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base Units</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.baseUnits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Category</CardTitle>
            <CardDescription>Select a category to filter units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Categories" },
                { value: "weight", label: "Weight" },
                { value: "volume", label: "Volume" },
                { value: "length", label: "Length" },
                { value: "area", label: "Area" },
                { value: "temperature", label: "Temperature" },
                { value: "pressure", label: "Pressure" },
                { value: "time", label: "Time" },
                { value: "count", label: "Count" },
              ].map((category) => (
                <Button
                  key={category.value}
                  variant={categoryFilter === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(category.value)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Units Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Units of Measure</CardTitle>
            <CardDescription>A list of all units with their conversion factors and categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={units}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search units..."
              actions={(unit: Unit) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="MASTER_DATA" screen="units" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(unit)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="MASTER_DATA" screen="units" action="update">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleStatus(unit)}
                    >
                      {unit.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="MASTER_DATA" screen="units" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(unit)}>
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
