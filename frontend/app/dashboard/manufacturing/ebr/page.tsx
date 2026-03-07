"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, User, Eye } from "lucide-react"
import { manufacturingApi } from "@/services"
import { formatDateISO } from "@/lib/utils"
import { toast } from "sonner"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface ElectronicBatchRecord {
  batchId: string
  batchNumber: string
  drugId: string
  drugName: string
  siteId: string
  siteName: string
  bomVersion: number
  plannedQuantity: number
  actualQuantity: number
  unitId: string
  unitName: string
  status: "draft" | "in_progress" | "completed" | "approved" | "rejected"
  steps: {
    stepNumber: number
    stepName: string
    instruction: string
    parameters: Record<string, unknown>
    performedBy?: string
    performedByName?: string
    performedAt?: string
    eSignature?: string
    status: "pending" | "in_progress" | "completed" | "skipped"
    remarks?: string
  }[]
  startDate: string
  endDate?: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export default function ElectronicBatchRecordsPage() {
  const router = useRouter()
  const [ebrs, setEbrs] = useState<ElectronicBatchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{ status?: string }>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchEbrs()
  }, [searchQuery, filters, pagination.page])

  const fetchEbrs = async () => {
    try {
      setLoading(true)
      const response = await manufacturingApi.getEBRs({
        search: searchQuery,
        status: filters.status,
        page: pagination.page,
        limit: 10,
      }) as { success?: boolean; data?: { ebrs?: ElectronicBatchRecord[]; pagination?: { page: number; pages: number; total: number } } }

      if (response?.data) {
        const ebrData = response.data
        const list = ebrData.ebrs ?? (Array.isArray(ebrData) ? ebrData : [])
        const pag = ebrData.pagination ?? { page: 1, pages: 1, total: (list as ElectronicBatchRecord[]).length }
        setEbrs(Array.isArray(list) ? list : [])
        setPagination({ page: pag.page, pages: pag.pages, total: pag.total })
      }
    } catch (error) {
      console.error("Failed to fetch electronic batch records:", error)
      toast.error("Failed to load electronic batch records")
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

  const handleView = (ebr: ElectronicBatchRecord) => {
    router.push(`/dashboard/manufacturing/ebr/${ebr.batchId}`)
  }

  const getStatusBadgeColor = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      approved: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
    }
    return map[status] ?? "bg-gray-100 text-gray-800"
  }

  const getStepStatusColor = (status: string) => {
    const map: Record<string, string> = {
      completed: "text-green-600",
      in_progress: "text-blue-600",
      pending: "text-gray-600",
      skipped: "text-yellow-600",
    }
    return map[status] ?? "text-gray-600"
  }

  const calculateProgress = (ebr: ElectronicBatchRecord) => {
    const totalSteps = ebr.steps?.length ?? 0
    const completedSteps = (ebr.steps ?? []).filter((s) => s.status === "completed").length
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
  }

  const stats = {
    total: pagination.total,
    inProgress: ebrs.filter((e) => e.status === "in_progress").length,
    completed: ebrs.filter((e) => e.status === "completed").length,
    approved: ebrs.filter((e) => e.status === "approved").length,
  }

  const columns = [
    {
      key: "batch",
      header: "Batch",
      sortable: true,
      render: (ebr: ElectronicBatchRecord) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{ebr.batchNumber}</div>
            <div className="text-sm text-muted-foreground">{ebr.drugName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "site",
      header: "Site",
      sortable: true,
      render: (ebr: ElectronicBatchRecord) => (
        <div className="text-sm">
          <div className="font-medium">{ebr.siteName}</div>
          <div className="text-muted-foreground">BOM v{ebr.bomVersion}</div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (ebr: ElectronicBatchRecord) => (
        <div className="space-y-1 text-sm">
          <div>Planned: {ebr.plannedQuantity} {ebr.unitName}</div>
          <div>Actual: {ebr.actualQuantity ?? "N/A"} {ebr.unitName}</div>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (ebr: ElectronicBatchRecord) => {
        const progress = calculateProgress(ebr)
        const steps = ebr.steps ?? []
        const completedSteps = steps.filter((s) => s.status === "completed").length
        const totalSteps = steps.length
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{completedSteps}/{totalSteps} steps</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: "steps",
      header: "Steps",
      render: (ebr: ElectronicBatchRecord) => {
        const steps = (ebr.steps ?? []).slice(0, 3)
        return (
          <div className="space-y-1">
            {steps.map((step) => (
              <div key={step.stepNumber} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">#{step.stepNumber}</span>
                <span className="truncate">{step.stepName}</span>
                <span className={`text-xs ${getStepStatusColor(step.status)}`}>{step.status}</span>
              </div>
            ))}
            {(ebr.steps?.length ?? 0) > 3 && (
              <div className="text-xs text-muted-foreground">+{(ebr.steps?.length ?? 0) - 3} more</div>
            )}
          </div>
        )
      },
    },
    {
      key: "timeline",
      header: "Timeline",
      sortable: true,
      render: (ebr: ElectronicBatchRecord) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>Started: {formatDateISO(ebr.startDate)}</span>
          </div>
          {ebr.endDate && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
              <span>Ended: {formatDateISO(ebr.endDate)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (ebr: ElectronicBatchRecord) => (
        <Badge className={getStatusBadgeColor(ebr.status)}>
          {ebr.status.charAt(0).toUpperCase() + ebr.status.slice(1).replace("_", " ")}
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
        { value: "draft", label: "Draft" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  ]

  const actions = (ebr: ElectronicBatchRecord) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="MANUFACTURING" action="read">
        <Button variant="ghost" size="sm" onClick={() => handleView(ebr)}>
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Electronic Batch Records</h1>
            <p className="text-muted-foreground">Manage electronic batch records and manufacturing steps</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total EBRs</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
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
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.approved}</div>
            </CardContent>
          </Card>
        </div>

        {/* EBRs Table */}
        <UnifiedDataTable
          data={ebrs}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search EBRs..."
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
          onRefresh={fetchEbrs}
          onExport={() => console.log("Export EBRs")}
          emptyMessage="No electronic batch records found."
        />
      </div>
    </DashboardLayout>
  )
}
