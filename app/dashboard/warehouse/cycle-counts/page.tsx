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
  CheckCircle, 
  Search, 
  Filter,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  MapPin,
  AlertCircle,
  Package,
  Play,
  Pause,
  RotateCcw,
  BarChart3
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { CycleCount, CycleCountFilters } from "@/types/warehouse"
import { formatDateISO } from "@/lib/utils"
import { CycleCountForm } from "@/components/warehouse/cycle-count-form"
import { toast } from "sonner"

export default function CycleCountsPage() {
  const [cycleCounts, setCycleCounts] = useState<CycleCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<CycleCountFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchCycleCounts()
  }, [searchQuery, filters, pagination.page])

  const fetchCycleCounts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getCycleCounts({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setCycleCounts(response.data.cycleCounts || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch cycle counts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof CycleCountFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (cycleCount: CycleCount) => {
    // TODO: Implement view functionality
    console.log("View cycle count:", cycleCount)
  }

  const handleEdit = (cycleCount: CycleCount) => {
    // TODO: Implement edit functionality
    console.log("Edit cycle count:", cycleCount)
  }

  const handleDelete = async (cycleCount: CycleCount) => {
    if (confirm("Are you sure you want to delete this cycle count?")) {
      try {
        const response = await apiService.deleteCycleCount(cycleCount.id)
        if (response.success) {
          toast.success("Cycle count deleted successfully")
          fetchCycleCounts()
        } else {
          toast.error("Failed to delete cycle count")
        }
      } catch (error) {
        console.error("Error deleting cycle count:", error)
        toast.error("An error occurred while deleting the cycle count")
      }
    }
  }

  const handleStart = (cycleCount: CycleCount) => {
    // TODO: Implement start functionality
    console.log("Start cycle count:", cycleCount)
  }

  const handleComplete = (cycleCount: CycleCount) => {
    // TODO: Implement complete functionality
    console.log("Complete cycle count:", cycleCount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800"><Play className="h-3 w-3 mr-1" />In Progress</Badge>
      case "Scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      case "Cancelled":
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getCountTypeBadge = (type: string) => {
    switch (type) {
      case "Full Count":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Full Count</Badge>
      case "Partial Count":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Partial Count</Badge>
      case "ABC Count":
        return <Badge className="bg-green-100 text-green-800"><BarChart3 className="h-3 w-3 mr-1" />ABC Count</Badge>
      case "Random Count":
        return <Badge className="bg-purple-100 text-purple-800"><RotateCcw className="h-3 w-3 mr-1" />Random Count</Badge>
      case "Location Count":
        return <Badge className="bg-orange-100 text-orange-800"><MapPin className="h-3 w-3 mr-1" />Location Count</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getProgressPercentage = (countedItems: number, totalItems: number) => {
    if (totalItems === 0) return 0
    return Math.round((countedItems / totalItems) * 100)
  }

  const getVarianceStatus = (varianceItems: number, totalItems: number) => {
    if (totalItems === 0) return { status: "No Data", color: "text-gray-600" }
    const variancePercentage = (varianceItems / totalItems) * 100
    if (variancePercentage === 0) return { status: "Perfect", color: "text-green-600" }
    if (variancePercentage <= 5) return { status: "Good", color: "text-green-600" }
    if (variancePercentage <= 10) return { status: "Acceptable", color: "text-yellow-600" }
    return { status: "High Variance", color: "text-red-600" }
  }

  const calculateStats = () => {
    const total = cycleCounts.length
    const scheduled = cycleCounts.filter(cc => cc.status === "Scheduled").length
    const inProgress = cycleCounts.filter(cc => cc.status === "In Progress").length
    const completed = cycleCounts.filter(cc => cc.status === "Completed").length
    const cancelled = cycleCounts.filter(cc => cc.status === "Cancelled").length

    return { total, scheduled, inProgress, completed, cancelled }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "countNumber",
      header: "Count #",
      render: (cycleCount: CycleCount) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {cycleCount.countNumber}
        </div>
      ),
    },
    {
      key: "countType",
      header: "Type",
      render: (cycleCount: CycleCount) => getCountTypeBadge(cycleCount.countType),
    },
    {
      key: "zone",
      header: "Zone",
      render: (cycleCount: CycleCount) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Zone {cycleCount.zone}
          </div>
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (cycleCount: CycleCount) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {cycleCount.assignedToName}
          </div>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (cycleCount: CycleCount) => {
        const progress = getProgressPercentage(cycleCount.countedItems, cycleCount.totalItems)
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="text-muted-foreground">
              {cycleCount.countedItems}/{cycleCount.totalItems} items
            </div>
          </div>
        )
      },
    },
    {
      key: "variance",
      header: "Variance",
      render: (cycleCount: CycleCount) => {
        const varianceStatus = getVarianceStatus(cycleCount.varianceItems, cycleCount.totalItems)
        return (
          <div className="text-sm">
            <div className={`font-medium ${varianceStatus.color}`}>
              {varianceStatus.status}
            </div>
            <div className="text-muted-foreground">
              {cycleCount.varianceItems} items
            </div>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (cycleCount: CycleCount) => getStatusBadge(cycleCount.status),
    },
    {
      key: "scheduledDate",
      header: "Scheduled",
      render: (cycleCount: CycleCount) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(cycleCount.scheduledDate)}
          </div>
        </div>
      ),
    },
    {
      key: "timeline",
      header: "Timeline",
      render: (cycleCount: CycleCount) => (
        <div className="text-sm">
          {cycleCount.startedAt ? (
            <>
              <div className="text-muted-foreground">
                Started: {formatDateISO(cycleCount.startedAt)}
              </div>
              {cycleCount.completedAt && (
                <div className="text-muted-foreground">
                  Completed: {formatDateISO(cycleCount.completedAt)}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Not started</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Cycle Count Management</h1>
            <p className="text-muted-foreground">Manage inventory cycle counts with variance reporting and adjustments</p>
          </div>
          <CycleCountForm onSuccess={fetchCycleCounts} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Counts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
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
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
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
                    placeholder="Search cycle counts..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Count Type</label>
                <Select value={filters.countType || ""} onValueChange={(value) => handleFilterChange("countType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Count">Full Count</SelectItem>
                    <SelectItem value="Partial Count">Partial Count</SelectItem>
                    <SelectItem value="ABC Count">ABC Count</SelectItem>
                    <SelectItem value="Random Count">Random Count</SelectItem>
                    <SelectItem value="Location Count">Location Count</SelectItem>
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
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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

        {/* Cycle Counts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Cycle Counts</CardTitle>
            <CardDescription>A comprehensive view of all cycle counts with variance reporting and adjustment tracking.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={cycleCounts}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search cycle counts..."
              actions={(cycleCount: CycleCount) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(cycleCount)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(cycleCount)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {cycleCount.status === "Scheduled" && (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => handleStart(cycleCount)}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {cycleCount.status === "In Progress" && (
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleComplete(cycleCount)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(cycleCount)}>
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
