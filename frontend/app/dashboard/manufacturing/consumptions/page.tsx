"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, Factory, TrendingUp, AlertTriangle, Eye, Edit, Trash2 } from "lucide-react"
import { manufacturingApi } from "@/services"
import { formatDateISO } from "@/lib/utils"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface BatchConsumption {
  id: string
  batchId: string
  batchNumber: string
  drugId?: string
  drugName?: string
  materialId: string
  materialName: string
  materialCode: string
  consumedQuantity: number
  unitId?: string
  unitName: string
  bomQuantity?: number
  variance?: number
  variancePercentage?: number
  consumptionDate: string
  consumedBy?: string
  consumedByName: string
  location?: string
  lotNumber: string
  expiryDate: string
  status: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export default function BatchConsumptionsPage() {
  const router = useRouter()
  const [consumptions, setConsumptions] = useState<BatchConsumption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ status?: string }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<BatchConsumption | null>(null)

  useEffect(() => {
    fetchConsumptions()
  }, [searchQuery, filters, pagination.page])

  const fetchConsumptions = async () => {
    try {
      setLoading(true)
      const response = await manufacturingApi.getMaterialConsumptions({
        status: filters.status,
        page: pagination.page,
        limit: 10,
      }) as { success?: boolean; data?: BatchConsumption[] | { consumptions?: BatchConsumption[]; pagination?: { page: number; pages: number; total: number } } }

      const raw = response?.data
      const list = Array.isArray(raw) ? raw : (raw as any)?.consumptions ?? []
      const pag = (raw as any)?.pagination ?? { page: 1, pages: 1, total: list?.length ?? 0 }
      setConsumptions(Array.isArray(list) ? list : [])
      setPagination({ page: pag.page ?? 1, pages: pag.pages ?? 1, total: pag.total ?? 0 })
    } catch (error) {
      console.error("Failed to fetch batch consumptions:", error)
      toast.error("Failed to load consumptions")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { status?: string })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (c: BatchConsumption) => {
    router.push(`/dashboard/manufacturing/batches/${c.batchId}`)
  }

  const handleDelete = (c: BatchConsumption) => {
    setItemToDelete(c)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    try {
      await manufacturingApi.deleteMaterialConsumption(itemToDelete.id)
      toast.success("Consumption record deleted")
      fetchConsumptions()
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete")
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const map: Record<string, string> = {
      consumed: "bg-green-100 text-green-800",
      returned: "bg-blue-100 text-blue-800",
      wasted: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    }
    return map[(status || "").toLowerCase()] ?? "bg-gray-100 text-gray-800"
  }

  const getVarianceColor = (variancePercentage?: number) => {
    if (variancePercentage == null) return "text-muted-foreground"
    const abs = Math.abs(variancePercentage)
    if (abs <= 5) return "text-green-600"
    if (abs <= 10) return "text-yellow-600"
    return "text-red-600"
  }

  const stats = {
    total: pagination.total,
    consumed: consumptions.filter((c) => (c.status || "").toLowerCase() === "consumed").length,
    wasted: consumptions.filter((c) => (c.status || "").toLowerCase() === "wasted").length,
    avgVariance:
      consumptions.length > 0
        ? (
            consumptions.reduce((sum, c) => sum + Math.abs(c.variancePercentage ?? 0), 0) /
            consumptions.length
          ).toFixed(1)
        : "0.0",
  }

  const columns = [
    {
      key: "batch",
      header: "Batch",
      sortable: true,
      render: (c: BatchConsumption) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Factory className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{c.batchNumber}</div>
            <div className="text-sm text-muted-foreground">{c.drugName ?? c.materialName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      sortable: true,
      render: (c: BatchConsumption) => (
        <div className="text-sm">
          <div className="font-medium">{c.materialName}</div>
          <div className="text-muted-foreground">{c.materialCode}</div>
        </div>
      ),
    },
    {
      key: "consumption",
      header: "Consumption",
      sortable: true,
      render: (c: BatchConsumption) => (
        <div className="space-y-1 text-sm">
          <div>Consumed: {c.consumedQuantity} {c.unitName}</div>
          {c.bomQuantity != null && <div>BOM: {c.bomQuantity} {c.unitName}</div>}
        </div>
      ),
    },
    {
      key: "variance",
      header: "Variance",
      render: (c: BatchConsumption) => (
        <div className="space-y-1">
          <div className={`text-sm font-medium ${getVarianceColor(c.variancePercentage)}`}>
            {c.variance != null ? `${c.variance > 0 ? "+" : ""}${c.variance} ${c.unitName}` : "—"}
          </div>
          {c.variancePercentage != null && (
            <div className={`text-xs ${getVarianceColor(c.variancePercentage)}`}>
              {c.variancePercentage > 0 ? "+" : ""}{c.variancePercentage.toFixed(1)}%
            </div>
          )}
        </div>
      ),
    },
    {
      key: "lot",
      header: "Lot Info",
      render: (c: BatchConsumption) => (
        <div className="space-y-1 text-sm">
          <div>Lot: {c.lotNumber}</div>
          <div>Expiry: {formatDateISO(c.expiryDate)}</div>
        </div>
      ),
    },
    {
      key: "consumedBy",
      header: "Consumed By",
      sortable: true,
      render: (c: BatchConsumption) => (
        <div className="text-sm">
          <div className="font-medium">{c.consumedByName}</div>
          <div className="text-muted-foreground">{formatDateISO(c.consumptionDate)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (c: BatchConsumption) => (
        <Badge className={getStatusBadgeColor(c.status)}>
          {(c.status || "pending").charAt(0).toUpperCase() + (c.status || "pending").slice(1)}
        </Badge>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "consumed", label: "Consumed" },
        { value: "returned", label: "Returned" },
        { value: "wasted", label: "Wasted" },
        { value: "pending", label: "Pending" },
      ],
    },
  ]

  const actions = (c: BatchConsumption) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => handleView(c)}>
        <Eye className="h-4 w-4" />
      </Button>
      <PermissionGuard module="MANUFACTURING" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(c)}
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
            <h1 className="text-3xl font-bold">Batch Consumptions</h1>
            <p className="text-muted-foreground">Track material consumption during batch manufacturing</p>
          </div>
          <PermissionGuard module="MANUFACTURING" action="create">
            <Button onClick={() => router.push("/dashboard/manufacturing/consumptions/new")}>
              <Plus />
              Add Consumption
            </Button>
          </PermissionGuard>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consumptions</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consumed</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.consumed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wasted</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.wasted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Variance</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.avgVariance}%</div>
            </CardContent>
          </Card>
        </div>

        <UnifiedDataTable
          data={consumptions}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search consumptions..."
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
          onRefresh={fetchConsumptions}
          onExport={() => console.log("Export consumptions")}
          emptyMessage="No consumption records found."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Consumption Record"
          description={`Are you sure you want to delete the consumption record for ${itemToDelete?.materialName}?`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
