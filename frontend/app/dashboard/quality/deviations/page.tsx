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
  AlertTriangle, 
  Search, 
  Filter,
  Clock,
  XCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Activity,
  Target,
  Beaker,
  Package
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { QADeviation, QADeviationFilters } from "@/types/quality-assurance"
import { formatDateISO } from "@/lib/utils"

export default function QADeviationsPage() {
  const [deviations, setDeviations] = useState<QADeviation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<QADeviationFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchDeviations()
  }, [searchQuery, filters, pagination.page])

  const fetchDeviations = async () => {
    try {
      setLoading(true)
      const response = await apiService.getQADeviations({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setDeviations(response.data.deviations || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch deviations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof QADeviationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>
      case "Major":
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />Major</Badge>
      case "Minor":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Minor</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Open</Badge>
      case "Under Investigation":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Under Investigation</Badge>
      case "Root Cause Identified":
        return <Badge className="bg-yellow-100 text-yellow-800"><Target className="h-3 w-3 mr-1" />Root Cause Identified</Badge>
      case "CAPA In Progress":
        return <Badge className="bg-orange-100 text-orange-800"><Activity className="h-3 w-3 mr-1" />CAPA In Progress</Badge>
      case "Resolved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>
      case "Closed":
        return <Badge className="bg-gray-100 text-gray-800"><CheckCircle className="h-3 w-3 mr-1" />Closed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Quality":
        return <Target className="h-4 w-4" />
      case "Safety":
        return <AlertTriangle className="h-4 w-4" />
      case "Compliance":
        return <FileText className="h-4 w-4" />
      case "Process":
        return <Activity className="h-4 w-4" />
      case "Documentation":
        return <FileText className="h-4 w-4" />
      case "Equipment":
        return <Beaker className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case "QC":
        return <Target className="h-4 w-4" />
      case "Production":
        return <Beaker className="h-4 w-4" />
      case "Warehouse":
        return <Package className="h-4 w-4" />
      case "Distribution":
        return <Activity className="h-4 w-4" />
      case "Customer":
        return <User className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const calculateStats = () => {
    const total = deviations.length
    const open = deviations.filter(dev => dev.status === "Open").length
    const underInvestigation = deviations.filter(dev => dev.status === "Under Investigation").length
    const resolved = deviations.filter(dev => dev.status === "Resolved").length
    const closed = deviations.filter(dev => dev.status === "Closed").length
    const overdue = deviations.filter(dev => {
      if (!dev.dueDate) return false
      return new Date(dev.dueDate) < new Date() && !["Resolved", "Closed"].includes(dev.status)
    }).length

    return { total, open, underInvestigation, resolved, closed, overdue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "deviationNumber",
      header: "Deviation #",
      render: (deviation: QADeviation) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {deviation.deviationNumber}
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (deviation: QADeviation) => (
        <div>
          <div className="font-medium">{deviation.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">{deviation.description}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (deviation: QADeviation) => (
        <div className="flex items-center gap-2">
          {getCategoryIcon(deviation.category)}
          <Badge variant="outline">{deviation.category}</Badge>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (deviation: QADeviation) => getSeverityBadge(deviation.severity),
    },
    {
      key: "status",
      header: "Status",
      render: (deviation: QADeviation) => getStatusBadge(deviation.status),
    },
    {
      key: "source",
      header: "Source",
      render: (deviation: QADeviation) => (
        <div className="flex items-center gap-2">
          {getSourceTypeIcon(deviation.sourceType)}
          <div className="text-sm">
            <div className="font-medium">{deviation.sourceType}</div>
            <div className="text-muted-foreground">{deviation.sourceReference}</div>
          </div>
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      render: (deviation: QADeviation) => (
        <div className="text-sm">
          {deviation.materialName ? (
            <>
              <div className="font-medium">{deviation.materialName}</div>
              <div className="text-muted-foreground">{deviation.batchNumber}</div>
            </>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (deviation: QADeviation) => (
        <div className="text-sm">
          {deviation.assignedToName ? (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {deviation.assignedToName}
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
      render: (deviation: QADeviation) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {deviation.dueDate ? formatDateISO(deviation.dueDate) : "N/A"}
        </div>
      ),
    },
    {
      key: "discoveredAt",
      header: "Discovered",
      render: (deviation: QADeviation) => formatDateISO(deviation.discoveredAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Deviation Tracker</h1>
            <p className="text-muted-foreground">Manage quality deviations and investigations</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus />
            New Deviation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deviations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.underInvestigation}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search deviations..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select value={filters.severity || ""} onValueChange={(value) => handleFilterChange("severity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor">Minor</SelectItem>
                    <SelectItem value="Major">Major</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={filters.category || ""} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quality">Quality</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Process">Process</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
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
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                    <SelectItem value="Root Cause Identified">Root Cause Identified</SelectItem>
                    <SelectItem value="CAPA In Progress">CAPA In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
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
                    <SelectItem value="7">Dr. Sarah Ahmed</SelectItem>
                    <SelectItem value="8">Mr. Muhammad Ali</SelectItem>
                    <SelectItem value="9">Ms. Fatima Hassan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deviations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Deviations</CardTitle>
            <CardDescription>A comprehensive tracker for managing quality deviations and investigations.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={deviations}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search deviations..."
              actions={(deviation: QADeviation) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {deviation.status === "Open" && (
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
