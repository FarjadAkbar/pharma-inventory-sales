"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, Factory, TrendingUp, AlertTriangle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface BatchConsumption {
  id: string
  batchId: string
  batchNumber: string
  drugId: string
  drugName: string
  materialId: string
  materialName: string
  materialCode: string
  consumedQuantity: number
  unitId: string
  unitName: string
  bomQuantity: number
  variance: number
  variancePercentage: number
  consumptionDate: string
  consumedBy: string
  consumedByName: string
  location: string
  lotNumber: string
  expiryDate: string
  status: "consumed" | "returned" | "wasted" | "pending"
  remarks?: string
  createdAt: string
  updatedAt: string
}

export default function BatchConsumptionsPage() {
  const [consumptions, setConsumptions] = useState<BatchConsumption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchConsumptions()
  }, [searchQuery, pagination.page, statusFilter])

  const fetchConsumptions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBatchConsumptions({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const consumptionData = response.data as {
          consumptions: BatchConsumption[]
          pagination: { page: number; pages: number; total: number }
        }
        setConsumptions(consumptionData.consumptions || [])
        setPagination(consumptionData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch batch consumptions:", error)
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

  const handleEdit = (consumption: BatchConsumption) => {
    window.location.href = `/dashboard/manufacturing/consumptions/${consumption.id}/edit`
  }

  const handleDelete = async (consumption: BatchConsumption) => {
    if (confirm(`Are you sure you want to delete consumption record for ${consumption.materialName}?`)) {
      try {
        await apiService.deleteBatchConsumption(consumption.id)
        fetchConsumptions()
      } catch (error) {
        console.error("Failed to delete batch consumption:", error)
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "consumed":
        return "bg-green-100 text-green-800"
      case "returned":
        return "bg-blue-100 text-blue-800"
      case "wasted":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVarianceColor = (variancePercentage: number) => {
    if (Math.abs(variancePercentage) <= 5) return "text-green-600"
    if (Math.abs(variancePercentage) <= 10) return "text-yellow-600"
    return "text-red-600"
  }

  const calculateStats = () => {
    const totalConsumptions = consumptions.length
    const consumedMaterials = consumptions.filter(c => c.status === "consumed").length
    const wastedMaterials = consumptions.filter(c => c.status === "wasted").length
    const avgVariance = consumptions.length > 0 
      ? (consumptions.reduce((sum, c) => sum + Math.abs(c.variancePercentage), 0) / consumptions.length).toFixed(1)
      : "0.0"

    return { totalConsumptions, consumedMaterials, wastedMaterials, avgVariance }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "batch",
      header: "Batch",
      render: (consumption: BatchConsumption) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Factory className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{consumption.batchNumber}</div>
            <div className="text-sm text-muted-foreground">{consumption.drugName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      render: (consumption: BatchConsumption) => (
        <div className="text-sm">
          <div className="font-medium">{consumption.materialName}</div>
          <div className="text-muted-foreground">{consumption.materialCode}</div>
        </div>
      ),
    },
    {
      key: "consumption",
      header: "Consumption",
      render: (consumption: BatchConsumption) => (
        <div className="space-y-1 text-sm">
          <div>Consumed: {consumption.consumedQuantity} {consumption.unitName}</div>
          <div>BOM: {consumption.bomQuantity} {consumption.unitName}</div>
        </div>
      ),
    },
    {
      key: "variance",
      header: "Variance",
      render: (consumption: BatchConsumption) => (
        <div className="space-y-1">
          <div className={`text-sm font-medium ${getVarianceColor(consumption.variancePercentage)}`}>
            {consumption.variance > 0 ? "+" : ""}{consumption.variance} {consumption.unitName}
          </div>
          <div className={`text-xs ${getVarianceColor(consumption.variancePercentage)}`}>
            {consumption.variancePercentage > 0 ? "+" : ""}{consumption.variancePercentage.toFixed(1)}%
          </div>
          {Math.abs(consumption.variancePercentage) > 10 && (
            <AlertTriangle className="h-3 w-3 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: "lot",
      header: "Lot Info",
      render: (consumption: BatchConsumption) => (
        <div className="space-y-1 text-sm">
          <div>Lot: {consumption.lotNumber}</div>
          <div>Expiry: {formatDateISO(consumption.expiryDate)}</div>
        </div>
      ),
    },
    {
      key: "consumedBy",
      header: "Consumed By",
      render: (consumption: BatchConsumption) => (
        <div className="text-sm">
          <div className="font-medium">{consumption.consumedByName}</div>
          <div className="text-muted-foreground">{formatDateISO(consumption.consumptionDate)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (consumption: BatchConsumption) => (
        <Badge className={getStatusBadgeColor(consumption.status)}>
          {consumption.status.charAt(0).toUpperCase() + consumption.status.slice(1)}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Consumptions</h1>
            <p className="text-muted-foreground">Track material consumption during batch manufacturing</p>
          </div>

          <PermissionGuard module="MANUFACTURING" screen="consumptions" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/manufacturing/consumptions/new")}>
              <Plus />
              Add Consumption
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consumptions</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consumed Materials</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.consumedMaterials}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wasted Materials</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.wastedMaterials}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Variance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.avgVariance}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
            <CardDescription>Select a status to filter consumption records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Consumptions" },
                { value: "consumed", label: "Consumed" },
                { value: "returned", label: "Returned" },
                { value: "wasted", label: "Wasted" },
                { value: "pending", label: "Pending" },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consumptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Batch Consumptions</CardTitle>
            <CardDescription>A list of all material consumption records with variance analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={consumptions}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search consumptions..."
              actions={(consumption: BatchConsumption) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="MANUFACTURING" screen="consumptions" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(consumption)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="MANUFACTURING" screen="consumptions" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(consumption)}>
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
