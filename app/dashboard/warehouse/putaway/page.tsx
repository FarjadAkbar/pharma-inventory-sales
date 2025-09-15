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
  Pause,
  RotateCcw
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { PutawayTask, PutawayFilters } from "@/types/warehouse"
import { formatDateISO } from "@/lib/utils"

export default function PutawayPage() {
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
      const response = await apiService.getPutawayTasks({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setPutawayTasks(response.data.putawayTasks || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch putaway tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof PutawayFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
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
      key: "taskNumber",
      header: "Task #",
      render: (task: PutawayTask) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {task.taskNumber}
        </div>
      ),
    },
    {
      key: "grn",
      header: "GRN",
      render: (task: PutawayTask) => (
        <div className="text-sm">
          <div className="font-medium">{task.grnNumber}</div>
          <div className="text-muted-foreground">ID: {task.grnId}</div>
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
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
      render: (task: PutawayTask) => (
        <div className="text-sm">
          <div className="font-medium">{task.batchNumber}</div>
          <div className="text-muted-foreground">{task.quantity} {task.unit}</div>
        </div>
      ),
    },
    {
      key: "locations",
      header: "Locations",
      render: (task: PutawayTask) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            From: {task.sourceLocation}
          </div>
          {task.targetLocation && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              To: {task.targetLocation}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (task: PutawayTask) => getPriorityBadge(task.priority),
    },
    {
      key: "status",
      header: "Status",
      render: (task: PutawayTask) => getStatusBadge(task.status),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (task: PutawayTask) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assignedToName}
          </div>
        </div>
      ),
    },
    {
      key: "temperature",
      header: "Temp Compliance",
      render: (task: PutawayTask) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            {task.temperatureCompliance ? (
              <span className="text-green-600">Compliant</span>
            ) : (
              <span className="text-red-600">Non-compliant</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "timeline",
      header: "Timeline",
      render: (task: PutawayTask) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(task.assignedAt)}
          </div>
          {task.completedAt && (
            <div className="text-muted-foreground">
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
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            New Task
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
                    placeholder="Search putaway tasks..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status || ""} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={filters.priority || ""} onValueChange={(value) => handleFilterChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned To</label>
                <Select value={filters.assignedTo || ""} onValueChange={(value) => handleFilterChange("assignedTo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">Mr. Muhammad Ali</SelectItem>
                    <SelectItem value="9">Ms. Fatima Hassan</SelectItem>
                    <SelectItem value="10">Mr. Ahmed Khan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Zone</label>
                <Select value={filters.zone || ""} onValueChange={(value) => handleFilterChange("zone", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Zone A (Raw Materials)</SelectItem>
                    <SelectItem value="B">Zone B (Finished Goods)</SelectItem>
                    <SelectItem value="C">Zone C (Quarantine)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Putaway Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Putaway Tasks</CardTitle>
            <CardDescription>A comprehensive view of all putaway tasks with location assignment and temperature compliance tracking.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={putawayTasks}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search putaway tasks..."
              actions={(task: PutawayTask) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {task.status === "Pending" && (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {task.status === "In Progress" && (
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
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
