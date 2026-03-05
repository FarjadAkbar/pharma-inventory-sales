"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  TestTube,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  User,
  Target,
  Calendar,
  Package,
  Beaker,
  Microscope,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { qualityControlApi } from "@/services"
import type { QCSample, QCSampleFilters } from "@/types/quality-control"
import { formatDateISO } from "@/lib/utils"
import { toast } from "@/lib/toast"
import { useRouter } from "next/navigation"

export default function QCSamplesPage() {
  const router = useRouter()
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
      const response = await qualityControlApi.getQCSamples({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })
      setQCSamples(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error("Failed to fetch QC samples:", error)
      toast.error("Failed to fetch QC samples", "Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters as QCSampleFilters)
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
      key: "sampleCode",
      header: "Sample #",
      render: (sample: QCSample) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {sample.sampleCode}
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
      render: (sample: QCSample) => {
        const tests = sample.tests || []
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">{tests.length} tests</div>
            {tests.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tests.slice(0, 2).map((test) => (
                  <div key={test.id} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                    {getTestIcon(test.testName)}
                    {test.testName}
                  </div>
                ))}
                {tests.length > 2 && (
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    +{tests.length - 2} more
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No tests assigned</div>
            )}
          </div>
        )
      },
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

  const filterOptions = [
    {
      key: "sourceType",
      label: "Source Type",
      type: "select" as const,
      options: [
        { value: "GRN", label: "GRN" },
        { value: "Batch", label: "Batch" },
        { value: "Production", label: "Production" },
        { value: "Stability", label: "Stability" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Pending", label: "Pending" },
        { value: "Assigned", label: "Assigned" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Failed", label: "Failed" },
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

  const actions = (sample: QCSample) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/quality/samples/${sample.id}/results`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/quality/samples/${sample.id}/edit`)}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QC Samples Queue</h1>
            <p className="text-muted-foreground">Manage quality control samples and testing workflow</p>
          </div>
          <Link href="/dashboard/quality/samples/new">
            <Button>
              <Plus />
              Add Sample
            </Button>
          </Link>
        </div>

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

        <UnifiedDataTable
          data={qcSamples}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search by sample #, material, batch..."
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
          onRefresh={fetchQCSamples}
          onExport={() => {}}
          emptyMessage="No QC samples found. Add a sample to get started."
        />
      </div>
    </DashboardLayout>
  )
}
