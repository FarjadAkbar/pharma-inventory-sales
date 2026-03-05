"use client"

import { useState, useEffect } from "react"
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
  Eye,
  Edit,
  User,
  Calendar,
  Package,
  FileText,
  Shield,
  CheckSquare,
  AlertCircle,
  Pause,
} from "lucide-react"
import Link from "next/link"
import { qualityAssuranceApi } from "@/services"
import type { QARelease, QAReleaseFilters } from "@/types/quality-assurance"
import { formatDateISO } from "@/lib/utils"
import { toast } from "@/lib/toast"
import { useRouter } from "next/navigation"

export default function QAReleasesPage() {
  const router = useRouter()
  const [qaReleases, setQAReleases] = useState<QARelease[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<QAReleaseFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchQAReleases()
  }, [searchQuery, filters, pagination.page])

  const fetchQAReleases = async () => {
    try {
      setLoading(true)
      const response = await qualityAssuranceApi.getQAReleases({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })
      setQAReleases(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error("Failed to fetch QA releases:", error)
      toast.error("Failed to fetch QA releases", "Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters as QAReleaseFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Under Review":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case "On Hold":
        return <Badge className="bg-orange-100 text-orange-800"><Pause className="h-3 w-3 mr-1" />On Hold</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-800"><CheckSquare className="h-3 w-3 mr-1" />Completed</Badge>
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

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "Release":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Release</Badge>
      case "Reject":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Reject</Badge>
      case "Hold":
        return <Badge className="bg-orange-100 text-orange-800"><Pause className="h-3 w-3 mr-1" />Hold</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
    }
  }

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case "ReceiptItem":
        return <Package className="h-4 w-4" />
      case "Batch":
        return <Beaker className="h-4 w-4" />
      case "Sample":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const calculateStats = () => {
    const total = qaReleases.length
    const pending = qaReleases.filter(release => release.status === "Pending").length
    const underReview = qaReleases.filter(release => release.status === "Under Review").length
    const approved = qaReleases.filter(release => release.status === "Approved").length
    const rejected = qaReleases.filter(release => release.status === "Rejected").length
    const onHold = qaReleases.filter(release => release.status === "On Hold").length

    return { total, pending, underReview, approved, rejected, onHold }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "releaseNumber",
      header: "Release #",
      render: (release: QARelease) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {release.releaseNumber}
        </div>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      render: (release: QARelease) => (
        <div>
          <div className="flex items-center gap-2">
            {getEntityTypeIcon(release.entityType)}
            <span className="font-medium">{release.materialName}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {release.entityReference} • {release.batchNumber}
          </div>
        </div>
      ),
    },
    {
      key: "qcResults",
      header: "QC Results",
      render: (release: QARelease) => {
        const qcResults = release.qcResults || []
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">{qcResults.length} tests</div>
            {qcResults.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="text-xs">
                  Pass: {qcResults.filter(r => r.passed).length}
                </div>
                <div className="text-xs">
                  Fail: {qcResults.filter(r => !r.passed).length}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No results</div>
            )}
          </div>
        )
      },
    },
    {
      key: "checklist",
      header: "Checklist",
      render: (release: QARelease) => {
        const checklistItems = release.checklistItems || []
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {checklistItems.filter(item => item.checked).length}/{checklistItems.length} items
            </div>
            {checklistItems.length > 0 ? (
              <div className="text-xs text-muted-foreground">
                {checklistItems.filter(item => item.isRequired && !item.checked).length} required pending
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No checklist</div>
            )}
          </div>
        )
      },
    },
    {
      key: "priority",
      header: "Priority",
      render: (release: QARelease) => getPriorityBadge(release.priority),
    },
    {
      key: "status",
      header: "Status",
      render: (release: QARelease) => getStatusBadge(release.status),
    },
    {
      key: "decision",
      header: "Decision",
      render: (release: QARelease) => getDecisionBadge(release.decision),
    },
    {
      key: "reviewedBy",
      header: "Reviewed By",
      render: (release: QARelease) => (
        <div className="text-sm">
          {release.reviewedByName ? (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {release.reviewedByName}
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
      render: (release: QARelease) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {release.dueDate ? formatDateISO(release.dueDate) : "N/A"}
        </div>
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted",
      render: (release: QARelease) => formatDateISO(release.submittedAt),
    },
  ]

  const filterOptions = [
    {
      key: "entityType",
      label: "Entity Type",
      type: "select" as const,
      options: [
        { value: "ReceiptItem", label: "Receipt Item" },
        { value: "Batch", label: "Batch" },
        { value: "Sample", label: "Sample" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Pending", label: "Pending" },
        { value: "Under Review", label: "Under Review" },
        { value: "Approved", label: "Approved" },
        { value: "Rejected", label: "Rejected" },
        { value: "On Hold", label: "On Hold" },
        { value: "Completed", label: "Completed" },
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

  const actions = (release: QARelease) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/quality/qa-releases/${release.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/quality/qa-releases/${release.id}/edit`)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {(release.status === "Pending" || release.status === "Under Review") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/quality/qa-releases/${release.id}/verify`)}
        >
          <Shield className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QA Release Board</h1>
            <p className="text-muted-foreground">Manage quality assurance releases and verification workflow</p>
          </div>
          <Link href="/dashboard/quality/qa-releases/new">
            <Button>
              <Plus />
              New Release
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Releases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
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
        </div>

        <UnifiedDataTable
          data={qaReleases}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search by release #, material, batch..."
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
          onRefresh={fetchQAReleases}
          onExport={() => {}}
          emptyMessage="No QA releases found. Create a release to get started."
        />
      </div>
    </DashboardLayout>
  )
}
