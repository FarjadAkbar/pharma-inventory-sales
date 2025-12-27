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
  Package, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Thermometer,
  MapPin,
  AlertCircle,
  Play,
  Pause
} from "lucide-react"
import { warehouseApi } from "@/services"
import type { PutawayTask, PutawayFilters } from "@/types/warehouse"
import { formatDateISO } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function PutawayPage() {
  const router = useRouter()
  const [putawayTasks, setPutawayTasks] = useState<PutawayTask[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<PutawayFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchPutawayTasks()
  }, [searchQuery, filters, pagination.page])

  const fetchPutawayTasks = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getPutawayTasks({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response && Array.isArray(response)) {
        setPutawayTasks(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch putaway tasks:", error)
      toast.error("Failed to load putaway tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters as PutawayFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (task: PutawayTask) => {
    // TODO: Implement view functionality
    console.log("View task:", task)
  }

  const handleEdit = (task: PutawayTask) => {
    // TODO: Implement edit functionality
    console.log("Edit task:", task)
  }

  const handleDelete = async (task: PutawayTask) => {
    if (confirm("Are you sure you want to delete this putaway task?")) {
      try {
        await warehouseApi.deletePutawayTask(task.id.toString())
        toast.success("Putaway task deleted successfully")
        fetchPutawayTasks()
      } catch (error: any) {
        console.error("Error deleting putaway task:", error)
        toast.error(error.message || "Failed to delete putaway task")
      }
    }
  }

  const handleStart = (task: PutawayTask) => {
    // TODO: Implement start functionality
    console.log("Start task:", task)
  }

  const handleComplete = (task: PutawayTask) => {
    // TODO: Implement complete functionality
    console.log("Complete task:", task)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800"><Play className="h-3 w-3 mr-1" />In Progress</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Assigned":
        return <Badge className="bg-orange-100 text-orange-800"><User className="h-3 w-3 mr-1" />Assigned</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case "Cancelled":
        return <Badge className="bg-gray-100 text-gray-800"><Pause className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Urgent</Badge>
      case "High":
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />High</Badge>
      case "Normal":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Normal</Badge>
      case "Low":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
    }
  }

  const getMaterialIcon = (materialName: string) => {
    if (materialName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (materialName.includes("API")) return <AlertCircle className="h-4 w-4" />
    if (materialName.includes("Cellulose")) return <Package className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  const calculateStats = () => {
    const total = putawayTasks.length
    const pending = putawayTasks.filter(task => task.status === "Pending").length
    const assigned = putawayTasks.filter(task => task.status === "Assigned").length
    const inProgress = putawayTasks.filter(task => task.status === "In Progress").length
    const completed = putawayTasks.filter(task => task.status === "Completed").length
    const failed = putawayTasks.filter(task => task.status === "Failed").length

    return { total, pending, assigned, inProgress, completed, failed }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "putawayNumber",
      header: "Task #",
      sortable: true,
      render: (task: any) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {task.putawayNumber || task.taskNumber || `PUT-${task.id}`}
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      sortable: true,
      render: (task: PutawayTask) => (
        <div>
          <div className="flex items-center gap-2">
            {getMaterialIcon(task.materialName)}
            <span className="font-medium">{task.materialName}</span>
          </div>
          <div className="text-sm text-muted-foreground">{task.materialCode}</div>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      sortable: true,
      render: (task: PutawayTask) => (
        <div className="text-sm">
          <div className="font-medium">{task.batchNumber}</div>
          <div className="text-muted-foreground">{task.quantity} {task.unit}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (task: any) => (
        <div className="text-sm">
          {task.locationId ? (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {task.locationId}
            </div>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          )}
          {task.zone && (
            <div className="text-muted-foreground">Zone: {task.zone}</div>
          )}
          {task.rack && task.shelf && (
            <div className="text-muted-foreground text-xs">Rack {task.rack}, Shelf {task.shelf}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (task: PutawayTask) => getStatusBadge(task.status),
    },
    {
      key: "requestedAt",
      header: "Requested",
      sortable: true,
      render: (task: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(task.requestedAt || task.assignedAt || task.createdAt)}
          </div>
          {task.completedAt && (
            <div className="text-muted-foreground text-xs">
              Completed: {formatDateISO(task.completedAt)}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Putaway Management</h1>
            <p className="text-muted-foreground">Manage putaway tasks with location assignment and temperature compliance</p>
          </div>
          <Button onClick={() => router.push("/dashboard/warehouse/putaway/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Putaway Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <User className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.assigned}</div>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Putaway Tasks Table */}
        <UnifiedDataTable
          data={putawayTasks}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search putaway tasks..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select" as const,
              options: [
                { value: "Pending", label: "Pending" },
                { value: "Assigned", label: "Assigned" },
                { value: "In Progress", label: "In Progress" },
                { value: "Completed", label: "Completed" },
                { value: "Cancelled", label: "Cancelled" },
              ],
            },
          ]}
          onFiltersChange={handleFilterChange}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            onPageChange: handlePageChange
          }}
          actions={(task: PutawayTask) => (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleView(task)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                <Edit className="h-4 w-4" />
              </Button>
              {task.status === "Pending" && (
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => handleStart(task)}>
                  <Play className="h-4 w-4" />
                </Button>
              )}
              {task.status === "In Progress" && (
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleComplete(task)}>
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(task)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          onRefresh={fetchPutawayTasks}
          onExport={() => console.log("Export putaway tasks")}
          emptyMessage="No putaway tasks found."
        />
      </div>
    </DashboardLayout>
  )
}
