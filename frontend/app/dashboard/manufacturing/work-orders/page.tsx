"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Calendar, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  User,
  Package,
  Beaker,
  Activity,
  Target,
  Play,
  Pause,
  AlertCircle
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { WorkOrder, WorkOrderFilters } from "@/types/manufacturing"
import { formatDateISO } from "@/lib/utils"

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<WorkOrderFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchWorkOrders()
  }, [searchQuery, filters, pagination.page])

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      const response = await apiService.getWorkOrders({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setWorkOrders(response.data.workOrders || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch work orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800"><Play className="h-3 w-3 mr-1" />In Progress</Badge>
      case "Planned":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Planned</Badge>
      case "On Hold":
        return <Badge className="bg-orange-100 text-orange-800"><Pause className="h-3 w-3 mr-1" />On Hold</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
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

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (drugName.includes("Capsule")) return <Beaker className="h-4 w-4" />
    if (drugName.includes("Syrup")) return <Activity className="h-4 w-4" />
    return <Target className="h-4 w-4" />
  }

  const calculateStats = () => {
    const total = workOrders.length
    const planned = workOrders.filter(wo => wo.status === "Planned").length
    const inProgress = workOrders.filter(wo => wo.status === "In Progress").length
    const completed = workOrders.filter(wo => wo.status === "Completed").length
    const onHold = workOrders.filter(wo => wo.status === "On Hold").length
    const cancelled = workOrders.filter(wo => wo.status === "Cancelled").length

    return { total, planned, inProgress, completed, onHold, cancelled }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "workOrderNumber",
      header: "Work Order #",
      sortable: true,
      render: (workOrder: WorkOrder) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {workOrder.workOrderNumber}
        </div>
      ),
    },
    {
      key: "drug",
      header: "Drug",
      sortable: true,
      render: (workOrder: WorkOrder) => (
        <div>
          <div className="flex items-center gap-2">
            {getDrugIcon(workOrder.drugName)}
            <span className="font-medium">{workOrder.drugName}</span>
          </div>
          <div className="text-sm text-muted-foreground">{workOrder.drugCode}</div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (workOrder: WorkOrder) => (
        <div className="text-sm">
          <div className="font-medium">{workOrder.plannedQuantity.toLocaleString()} {workOrder.unit}</div>
          {workOrder.actualQuantity && (
            <div className="text-muted-foreground">
              Actual: {workOrder.actualQuantity.toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "site",
      header: "Production Site",
      sortable: true,
      render: (workOrder: WorkOrder) => (
        <div className="text-sm">
          <div className="font-medium">{workOrder.siteName}</div>
          <div className="text-muted-foreground">BOM v{workOrder.bomVersion}</div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (workOrder: WorkOrder) => getPriorityBadge(workOrder.priority),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (workOrder: WorkOrder) => getStatusBadge(workOrder.status),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      sortable: true,
      render: (workOrder: WorkOrder) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {workOrder.assignedToName}
          </div>
        </div>
      ),
    },
    {
      key: "plannedDates",
      header: "Planned Dates",
      sortable: true,
      render: (workOrder: WorkOrder) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(workOrder.plannedStartDate)}
          </div>
          <div className="text-muted-foreground">
            to {formatDateISO(workOrder.plannedEndDate)}
          </div>
        </div>
      ),
    },
    {
      key: "actualDates",
      header: "Actual Dates",
      sortable: true,
      render: (workOrder: WorkOrder) => (
        <div className="text-sm">
          {workOrder.actualStartDate ? (
            <>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateISO(workOrder.actualStartDate)}
              </div>
              {workOrder.actualEndDate && (
                <div className="text-muted-foreground">
                  to {formatDateISO(workOrder.actualEndDate)}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Not started</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (workOrder: WorkOrder) => formatDateISO(workOrder.createdAt),
    },
  ]

  const filterOptions = [
    {
      key: "drugId",
      label: "Drug",
      type: "select" as const,
      options: [
        { value: "1", label: "Paracetamol Tablets" },
        { value: "2", label: "Ibuprofen Tablets" },
        { value: "3", label: "Aspirin Tablets" },
      ],
    },
    {
      key: "siteId",
      label: "Site",
      type: "select" as const,
      options: [
        { value: "1", label: "Main Production Facility" },
        { value: "2", label: "Secondary Production Facility" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Draft", label: "Draft" },
        { value: "Planned", label: "Planned" },
        { value: "In Progress", label: "In Progress" },
        { value: "On Hold", label: "On Hold" },
        { value: "Completed", label: "Completed" },
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
      ],
    },
  ]

  const actions = (workOrder: WorkOrder) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Edit className="h-4 w-4" />
      </Button>
      {workOrder.status === "Planned" && (
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          <Play className="h-4 w-4" />
        </Button>
      )}
      {workOrder.status === "In Progress" && (
        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
          <Pause className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
            <p className="text-muted-foreground">Manage production work orders and planning</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus />
            New Work Order
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Hold</CardTitle>
              <Pause className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.onHold}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Work Orders Table */}
        <UnifiedDataTable
          data={workOrders}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search work orders..."
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
          onRefresh={fetchWorkOrders}
          onExport={() => console.log("Export work orders")}
          emptyMessage="No work orders found. Create your first work order to get started."
        />
      </div>
    </DashboardLayout>
  )
}
