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
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface ApprovalRequest {
  id: string
  requestNumber: string
  documentId: string
  documentTitle: string
  documentType: string
  requesterId: string
  requesterName: string
  approverId?: string
  approverName?: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  priority: "low" | "normal" | "high" | "urgent"
  requestDate: string
  dueDate: string
  approvedAt?: string
  rejectedAt?: string
  comments?: string
  rejectionReason?: string
  workflowStep: number
  totalSteps: number
  createdAt: string
  updatedAt: string
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchApprovals()
  }, [searchQuery, pagination.page, filters])

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const response = await apiService.getApprovalRequests({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setApprovals(response.data.approvals || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch approval requests:", error)
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

  const handleView = (approval: ApprovalRequest) => {
    console.log("View approval:", approval)
  }

  const handleEdit = (approval: ApprovalRequest) => {
    console.log("Edit approval:", approval)
  }

  const handleApprove = async (approval: ApprovalRequest) => {
    try {
      await apiService.approveRequest(approval.id)
      fetchApprovals()
    } catch (error) {
      console.error("Failed to approve request:", error)
    }
  }

  const handleReject = async (approval: ApprovalRequest) => {
    try {
      await apiService.rejectRequest(approval.id)
      fetchApprovals()
    } catch (error) {
      console.error("Failed to reject request:", error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const calculateStats = () => {
    const total = approvals.length
    const pending = approvals.filter(a => a.status === "pending").length
    const approved = approvals.filter(a => a.status === "approved").length
    const rejected = approvals.filter(a => a.status === "rejected").length
    const overdue = approvals.filter(a => a.status === "pending" && isOverdue(a.dueDate)).length

    return { total, pending, approved, rejected, overdue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "request",
      header: "Request",
      sortable: true,
      render: (approval: ApprovalRequest) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{approval.documentTitle}</div>
            <div className="text-sm text-muted-foreground">{approval.requestNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: "documentType",
      header: "Document Type",
      sortable: true,
      render: (approval: ApprovalRequest) => (
        <Badge variant="outline">
          {approval.documentType.charAt(0).toUpperCase() + approval.documentType.slice(1)}
        </Badge>
      ),
    },
    {
      key: "requester",
      header: "Requester",
      sortable: true,
      render: (approval: ApprovalRequest) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="font-medium">{approval.requesterName}</span>
          </div>
          <div className="text-muted-foreground">
            {formatDateISO(approval.requestDate)}
          </div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (approval: ApprovalRequest) => (
        <Badge className={getPriorityBadgeColor(approval.priority)}>
          {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (approval: ApprovalRequest) => (
        <div className="space-y-1">
          <Badge className={getStatusBadgeColor(approval.status)}>
            {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
          </Badge>
          {approval.status === "pending" && isOverdue(approval.dueDate) && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "workflow",
      header: "Workflow",
      sortable: true,
      render: (approval: ApprovalRequest) => (
        <div className="text-sm">
          <div className="font-medium">Step {approval.workflowStep} of {approval.totalSteps}</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-primary h-2 rounded-full"
              style={{ width: `${(approval.workflowStep / approval.totalSteps) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (approval: ApprovalRequest) => (
        <div className="text-sm">
          <div className={`flex items-center gap-1 ${
            approval.status === "pending" && isOverdue(approval.dueDate) ? "text-red-600" : ""
          }`}>
            <Calendar className="h-3 w-3" />
            <span>{formatDateISO(approval.dueDate)}</span>
          </div>
          {approval.status === "pending" && isOverdue(approval.dueDate) && (
            <div className="text-xs text-red-600">Overdue</div>
          )}
        </div>
      ),
    },
    {
      key: "approver",
      header: "Approver",
      sortable: true,
      render: (approval: ApprovalRequest) => (
        <div className="text-sm">
          {approval.approverName ? (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="font-medium">{approval.approverName}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
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
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select" as const,
      options: [
        { value: "urgent", label: "Urgent" },
        { value: "high", label: "High" },
        { value: "normal", label: "Normal" },
        { value: "low", label: "Low" },
      ],
    },
    {
      key: "documentType",
      label: "Document Type",
      type: "select" as const,
      options: [
        { value: "license", label: "License" },
        { value: "permit", label: "Permit" },
        { value: "certificate", label: "Certificate" },
        { value: "approval", label: "Approval" },
        { value: "registration", label: "Registration" },
        { value: "compliance", label: "Compliance" },
        { value: "policy", label: "Policy" },
      ],
    },
  ]

  const actions = (approval: ApprovalRequest) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="REGULATORY" screen="approvals" action="view">
        <Button variant="ghost" size="sm" onClick={() => handleView(approval)}>
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="REGULATORY" screen="approvals" action="update">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(approval)}>
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      {approval.status === "pending" && (
        <>
          <PermissionGuard module="REGULATORY" screen="approvals" action="approve">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-600 hover:text-green-700"
              onClick={() => handleApprove(approval)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard module="REGULATORY" screen="approvals" action="reject">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => handleReject(approval)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </>
      )}
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Approvals</h1>
            <p className="text-muted-foreground">Manage document approval workflows and requests</p>
          </div>

          <PermissionGuard module="REGULATORY" screen="approvals" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/regulatory/approvals/new")}>
              <Plus />
              New Request
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
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
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Approvals Table */}
        <UnifiedDataTable
          data={approvals}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search approval requests..."
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
          onRefresh={fetchApprovals}
          onExport={() => console.log("Export approvals")}
          emptyMessage="No approval requests found. Create your first request to get started."
        />
      </div>
    </DashboardLayout>
  )
}
