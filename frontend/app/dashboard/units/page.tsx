"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, Scale, Ruler, Eye, Edit, Trash2, Calculator } from "lucide-react"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
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
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ category?: string; status?: string }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)

  useEffect(() => {
    fetchUnits()
  }, [searchQuery, filters, pagination.page])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUnits({
        search: searchQuery,
        category: filters.category,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const unitData = response.data as {
          units: Unit[]
          pagination?: { page: number; pages: number; total: number }
        }
        const list = unitData.units || []
        setUnits(list)
        setPagination(
          unitData.pagination || { page: 1, pages: 1, total: list.length }
        )
      }
    } catch (error) {
      console.error("Failed to fetch units:", error)
      toast.error("Failed to load units")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { category?: string; status?: string })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleEdit = (unit: Unit) => {
    router.push(`/dashboard/units/${unit.id}`)
  }

  const handleDelete = (unit: Unit) => {
    setUnitToDelete(unit)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return

    try {
      await apiService.deleteUnit(unitToDelete.id)
      toast.success("Unit deleted successfully")
      fetchUnits()
      setDeleteDialogOpen(false)
      setUnitToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete unit")
    }
  }

  const handleToggleStatus = async (unit: Unit) => {
    try {
      await apiService.updateUnit(unit.id, { isActive: !unit.isActive })
      toast.success(unit.isActive ? "Unit deactivated" : "Unit activated")
      fetchUnits()
    } catch (error: any) {
      toast.error(error.message || "Failed to update unit status")
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    const map: Record<string, string> = {
      weight: "bg-blue-100 text-blue-800",
      volume: "bg-green-100 text-green-800",
      length: "bg-purple-100 text-purple-800",
      area: "bg-orange-100 text-orange-800",
      temperature: "bg-red-100 text-red-800",
      pressure: "bg-yellow-100 text-yellow-800",
      time: "bg-teal-100 text-teal-800",
      count: "bg-gray-100 text-gray-800",
    }
    return map[category] || "bg-gray-100 text-gray-800"
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "weight":
        return <Scale className="h-4 w-4" />
      case "volume":
        return <Package className="h-4 w-4" />
      case "length":
        return <Ruler className="h-4 w-4" />
      default:
        return <Calculator className="h-4 w-4" />
    }
  }

  const columns = [
    {
      key: "name",
      header: "Unit",
      sortable: true,
      render: (unit: Unit) => (
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {getCategoryIcon(unit.category)}
          </div>
          <div>
            <div className="font-medium">{unit.name}</div>
            <div className="text-sm text-muted-foreground">
              {unit.code} ({unit.symbol})
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (unit: Unit) => (
        <Badge className={getCategoryBadgeColor(unit.category)}>
          {unit.category.charAt(0).toUpperCase() + unit.category.slice(1)}
        </Badge>
      ),
    },
    {
      key: "conversion",
      header: "Conversion",
      sortable: true,
      render: (unit: Unit) => (
        <div className="text-sm">
          {unit.baseUnit ? (
            <Badge variant="secondary">Base Unit</Badge>
          ) : (
            <div>
              <div>Factor: {unit.conversionFactor}</div>
              {unit.baseUnitName && (
                <div className="text-muted-foreground">Base: {unit.baseUnitName}</div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "precision",
      header: "Precision",
      sortable: true,
      render: (unit: Unit) => (
        <span className="text-sm font-mono">{unit.precision} dp</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (unit: Unit) => (
        <Badge variant={unit.isActive ? "default" : "secondary"}>
          {unit.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "category",
      label: "Category",
      type: "select" as const,
      options: [
        { value: "weight", label: "Weight" },
        { value: "volume", label: "Volume" },
        { value: "length", label: "Length" },
        { value: "area", label: "Area" },
        { value: "temperature", label: "Temperature" },
        { value: "pressure", label: "Pressure" },
        { value: "time", label: "Time" },
        { value: "count", label: "Count" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]

  // Apply client-side status filter (API may not support it)
  const filteredUnits = useMemo(() => {
    if (filters.status === "active") return units.filter((u) => u.isActive)
    if (filters.status === "inactive") return units.filter((u) => !u.isActive)
    return units
  }, [units, filters.status])

  const stats = {
    total: pagination.total || units.length,
    active: units.filter((u) => u.isActive).length,
    baseUnits: units.filter((u) => u.baseUnit).length,
    categories: [...new Set(units.map((u) => u.category))].length,
  }

  const actions = (unit: Unit) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="MASTER_DATA" screen="units" action="read">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(unit)}>
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="units" action="update">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggleStatus(unit)}
          title={unit.isActive ? "Deactivate" : "Activate"}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="units" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(unit)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Units of Measure</h1>
            <p className="text-muted-foreground">
              Manage units of measure and conversion factors
            </p>
          </div>
          <PermissionGuard module="MASTER_DATA" screen="units" action="create">
            <Button onClick={() => router.push("/dashboard/units/new")}>
              <Plus />
              Add Unit
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Scale className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base Units</CardTitle>
              <Calculator className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.baseUnits}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Ruler className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.categories}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Units Table */}
        <UnifiedDataTable
          data={filteredUnits}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search units..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={filterOptions}
          onFiltersChange={handleFiltersChange}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          onRefresh={fetchUnits}
          onExport={() => console.log("Export units")}
          emptyMessage="No units found. Add your first unit to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Unit"
          description={`Are you sure you want to delete unit "${unitToDelete?.name}" (${unitToDelete?.code})? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
