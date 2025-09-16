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
  TestTube, 
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
  Package,
  Beaker,
  Microscope,
  Activity,
  Target,
  FileText
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { QCSample, QCSampleFilters } from "@/types/quality-control"
import { formatDateISO } from "@/lib/utils"

export default function QCSamplesPage() {
  const [qcSamples, setQCSamples] = useState<QCSample[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<QCSampleFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchQCSamples()
  }, [searchQuery, filters, pagination.page])

  const fetchQCSamples = async () => {
    try {
      setLoading(true)
      const response = await apiService.getQCSamples({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setQCSamples(response.data.qcSamples || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch QC samples:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof QCSampleFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Urgent</Badge>
      case "High":
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="h-3 w-3 mr-1" />High</Badge>
      case "Normal":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Normal</Badge>
      case "Low":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>
      case "Assigned":
        return <Badge className="bg-yellow-100 text-yellow-800"><User className="h-3 w-3 mr-1" />Assigned</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case "Cancelled":
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
    }
  }

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case "GRN":
        return <Package className="h-4 w-4" />
      case "Batch":
        return <Beaker className="h-4 w-4" />
      case "Production":
        return <Activity className="h-4 w-4" />
      case "Stability":
        return <Clock className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  const getTestIcon = (testName: string) => {
    if (testName.includes("Assay")) return <Target className="h-3 w-3" />
    if (testName.includes("Dissolution")) return <Activity className="h-3 w-3" />
    if (testName.includes("Identification")) return <Eye className="h-3 w-3" />
    if (testName.includes("Microbial")) return <Microscope className="h-3 w-3" />
    return <TestTube className="h-3 w-3" />
  }

  const calculateStats = () => {
    const total = qcSamples.length
    const pending = qcSamples.filter(sample => sample.status === "Pending").length
    const inProgress = qcSamples.filter(sample => sample.status === "In Progress").length
    const completed = qcSamples.filter(sample => sample.status === "Completed").length
    const overdue = qcSamples.filter(sample => {
      if (!sample.dueDate) return false
      return new Date(sample.dueDate) < new Date() && sample.status !== "Completed"
    }).length

    return { total, pending, inProgress, completed, overdue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "sampleNumber",
      header: "Sample #",
      render: (sample: QCSample) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {sample.sampleNumber}
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      render: (sample: QCSample) => (
        <div>
          <div className="font-medium">{sample.materialName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            {getSourceTypeIcon(sample.sourceType)}
            {sample.sourceReference} • {sample.batchNumber}
          </div>
        </div>
      ),
    },
    {
      key: "tests",
      header: "Tests",
      render: (sample: QCSample) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{sample.tests.length} tests</div>
          <div className="flex flex-wrap gap-1">
            {sample.tests.slice(0, 2).map((test) => (
              <div key={test.id} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                {getTestIcon(test.testName)}
                {test.testName}
              </div>
            ))}
            {sample.tests.length > 2 && (
              <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                +{sample.tests.length - 2} more
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (sample: QCSample) => getPriorityBadge(sample.priority),
    },
    {
      key: "status",
      header: "Status",
      render: (sample: QCSample) => getStatusBadge(sample.status),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (sample: QCSample) => (
        <div className="text-sm">
          {sample.assignedToName ? (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {sample.assignedToName}
            </div>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (sample: QCSample) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {sample.dueDate ? formatDateISO(sample.dueDate) : "N/A"}
        </div>
      ),
    },
    {
      key: "requestedAt",
      header: "Requested",
      render: (sample: QCSample) => formatDateISO(sample.requestedAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QC Samples Queue</h1>
            <p className="text-muted-foreground">Manage quality control samples and testing workflow</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Sample
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
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
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
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
                    placeholder="Search samples..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <Select value={filters.sourceType || ""} onValueChange={(value) => handleFilterChange("sourceType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRN">GRN</SelectItem>
                    <SelectItem value="Batch">Batch</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Stability">Stability</SelectItem>
                  </SelectContent>
                </Select>
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
                <label className="text-sm font-medium">Analyst</label>
                <Select value={filters.assignedTo || ""} onValueChange={(value) => handleFilterChange("assignedTo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Analysts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">Dr. Fatima Khan</SelectItem>
                    <SelectItem value="5">Ms. Ayesha Ahmed</SelectItem>
                    <SelectItem value="6">Mr. Hassan Ali</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QC Samples Table */}
        <Card>
          <CardHeader>
            <CardTitle>QC Samples Queue</CardTitle>
            <CardDescription>A comprehensive queue of quality control samples awaiting testing.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={qcSamples}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search QC samples..."
              actions={(sample: QCSample) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {sample.status === "Pending" && (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <User className="h-4 w-4" />
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
