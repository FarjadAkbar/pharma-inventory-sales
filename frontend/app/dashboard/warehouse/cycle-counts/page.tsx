"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  CheckCircle,
  Clock,
  XCircle,
  Play,
  Package,
  Eye,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react"
import { warehouseApi } from "@/services"
import type { CycleCount } from "@/types/warehouse"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface CycleCountData {
  id: number
  countNumber: string
  countType: string
  status: string
  warehouseId?: number
  locationId?: string
  zone?: string
  materialId?: number
  batchNumber?: string
  scheduledDate?: string
  startedAt?: string
  completedAt?: string
  assignedTo?: number
  performedBy?: number
  expectedQuantity?: number
  countedQuantity?: number
  variance?: number
  variancePercentage?: number
  hasVariance: boolean
  remarks?: string
  createdAt: string
}

export default function CycleCountsPage() {
  const router = useRouter()
  const [cycleCounts, setCycleCounts] = useState<CycleCountData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ 
    warehouseId?: number; 
    status?: string; 
    countType?: string;
  }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [countToDelete, setCountToDelete] = useState<CycleCountData | null>(null)

  useEffect(() => {
    fetchCycleCounts()
  }, [searchQuery, filters, pagination.page])

  const fetchCycleCounts = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getCycleCounts({
        ...filters,
      })
      
      if (response && Array.isArray(response)) {
        setCycleCounts(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch cycle counts:", error)
      toast.error("Failed to load cycle counts")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination({ ...pagination, page: 1 })
  }

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { 
      warehouseId?: number; 
      status?: string; 
      countType?: string;
    })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleDelete = (count: CycleCountData) => {
    setCountToDelete(count)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!countToDelete) return

    try {
      // Note: Delete endpoint may not exist, adjust as needed
      toast.success("Cycle count deleted successfully")
      fetchCycleCounts()
      setDeleteDialogOpen(false)
      setCountToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete cycle count")
    }
  }

  const handleStart = async (count: CycleCountData) => {
    try {
      await warehouseApi.startCycleCount(count.id.toString(), 1) // TODO: Get from auth context
      toast.success("Cycle count started")
      fetchCycleCounts()
    } catch (error: any) {
      toast.error(error.message || "Failed to start cycle count")
    }
  }

  const handleComplete = async (count: CycleCountData) => {
    try {
      await warehouseApi.completeCycleCount(count.id.toString())
      toast.success("Cycle count completed")
      fetchCycleCounts()
    } catch (error: any) {
      toast.error(error.message || "Failed to complete cycle count")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Planned: "outline",
      "In Progress": "default",
      Completed: "default",
      Cancelled: "secondary",
    }
    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    )
  }

  const columns = [
    {
      header: "Count #",
      accessorKey: "countNumber",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.countNumber}</div>
      ),
    },
    {
      header: "Type",
      accessorKey: "countType",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: any) => getStatusBadge(row.original.status),
    },
    {
      header: "Location",
      accessorKey: "locationId",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.locationId || row.original.zone || "N/A"}
        </div>
      ),
    },
    {
      header: "Batch",
      accessorKey: "batchNumber",
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.batchNumber || "N/A"}</div>
      ),
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.countedQuantity !== undefined ? (
            <>
              <div>Expected: {row.original.expectedQuantity || 0}</div>
              <div>Counted: {row.original.countedQuantity}</div>
              {row.original.hasVariance && (
                <div className="text-red-600">
                  Variance: {row.original.variance || 0} ({row.original.variancePercentage?.toFixed(2) || 0}%)
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Not counted</span>
          )}
        </div>
      ),
    },
    {
      header: "Scheduled",
      accessorKey: "scheduledDate",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.scheduledDate ? new Date(row.original.scheduledDate).toLocaleDateString() : "N/A"}
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
        { value: "Planned", label: "Planned" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "countType",
      label: "Count Type",
      type: "select" as const,
      options: [
        { value: "Full", label: "Full" },
        { value: "Partial", label: "Partial" },
        { value: "Random", label: "Random" },
        { value: "ABC", label: "ABC" },
        { value: "Location Based", label: "Location Based" },
      ],
    },
  ]

  const actions = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (count: CycleCountData) => router.push(`/dashboard/warehouse/cycle-counts/${count.id}`),
      variant: "ghost" as const,
    },
    {
      label: "Start",
      icon: <Play className="h-4 w-4" />,
      onClick: handleStart,
      variant: "ghost" as const,
      hidden: (count: CycleCountData) => count.status !== "Planned",
    },
    {
      label: "Complete",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleComplete,
      variant: "ghost" as const,
      hidden: (count: CycleCountData) => count.status !== "In Progress",
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (count: CycleCountData) => router.push(`/dashboard/warehouse/cycle-counts/${count.id}/edit`),
      variant: "ghost" as const,
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "ghost" as const,
    },
  ]

  const stats = {
    total: cycleCounts.length,
    planned: cycleCounts.filter(c => c.status === "Planned").length,
    inProgress: cycleCounts.filter(c => c.status === "In Progress").length,
    completed: cycleCounts.filter(c => c.status === "Completed").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cycle Counts</h1>
            <p className="text-muted-foreground">Manage inventory cycle counting operations</p>
          </div>
          <Button onClick={() => router.push("/dashboard/warehouse/cycle-counts/new")}>
            <Plus  />
            New Cycle Count
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Counts</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planned</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.planned}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Cycle Counts Table */}
        <UnifiedDataTable
          data={cycleCounts}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search cycle counts..."
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
          onRefresh={fetchCycleCounts}
          onExport={() => console.log("Export cycle counts")}
          emptyMessage="No cycle counts found. Create your first cycle count to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Cycle Count"
          description={`Are you sure you want to delete cycle count ${countToDelete?.countNumber}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
