"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Package, 
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  User,
  ArrowRight,
  ShoppingCart,
  CheckSquare
} from "lucide-react"
import { warehouseApi } from "@/services"
import type { MaterialIssue, MaterialIssueFilters } from "@/types/warehouse"
import { formatDateISO } from "@/lib/utils"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function MaterialIssuesPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<MaterialIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<MaterialIssueFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'pick' | 'issue' | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<MaterialIssue | null>(null)

  useEffect(() => {
    fetchMaterialIssues()
  }, [searchQuery, filters, pagination.page])

  const fetchMaterialIssues = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getMaterialIssues({
        ...filters,
      })
      
      if (response && Array.isArray(response)) {
        setIssues(response)
        setPagination({ page: 1, pages: 1, total: response.length })
      }
    } catch (error) {
      console.error("Failed to fetch material issues:", error)
      toast.error("Failed to load material issues")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination({ ...pagination, page: 1 })
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters as MaterialIssueFilters)
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleApprove = (issue: MaterialIssue) => {
    setSelectedIssue(issue)
    setActionType('approve')
    setActionDialogOpen(true)
  }

  const handlePick = (issue: MaterialIssue) => {
    setSelectedIssue(issue)
    setActionType('pick')
    setActionDialogOpen(true)
  }

  const handleIssue = (issue: MaterialIssue) => {
    setSelectedIssue(issue)
    setActionType('issue')
    setActionDialogOpen(true)
  }

  const handleActionConfirm = async () => {
    if (!selectedIssue) return

    try {
      const userId = 1 // TODO: Get from auth context
      
      if (actionType === 'approve') {
        await warehouseApi.approveMaterialIssue(selectedIssue.id.toString(), {
          approvedBy: userId,
        })
        toast.success("Material issue approved successfully")
      } else if (actionType === 'pick') {
        await warehouseApi.pickMaterialIssue(selectedIssue.id.toString(), userId)
        toast.success("Material issue picked successfully")
      } else if (actionType === 'issue') {
        await warehouseApi.issueMaterial(selectedIssue.id.toString(), userId)
        toast.success("Material issued successfully")
      }
      
      fetchMaterialIssues()
      setActionDialogOpen(false)
      setSelectedIssue(null)
      setActionType(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to perform action")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Approved":
        return <Badge className="bg-blue-100 text-blue-800"><CheckSquare className="h-3 w-3 mr-1" />Approved</Badge>
      case "Picked":
        return <Badge className="bg-purple-100 text-purple-800"><ShoppingCart className="h-3 w-3 mr-1" />Picked</Badge>
      case "Issued":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Issued</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const columns = [
    {
      key: "issueNumber",
      header: "Issue #",
      sortable: true,
      render: (issue: MaterialIssue) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {issue.issueNumber}
        </div>
      ),
    },
    {
      key: "material",
      header: "Material",
      sortable: true,
      render: (issue: MaterialIssue) => (
        <div>
          <div className="font-medium">{issue.materialName}</div>
          <div className="text-sm text-muted-foreground">{issue.materialCode}</div>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      sortable: true,
      render: (issue: MaterialIssue) => (
        <div className="text-sm">
          {issue.batchNumber || "N/A"}
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (issue: MaterialIssue) => (
        <div>
          {issue.quantity} {issue.unit}
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (issue: MaterialIssue) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          {issue.fromLocationId || "N/A"}
        </div>
      ),
    },
    {
      key: "workOrder",
      header: "Work Order",
      sortable: true,
      render: (issue: MaterialIssue) => (
        <div className="text-sm">
          {issue.workOrderId || "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (issue: MaterialIssue) => getStatusBadge(issue.status),
    },
    {
      key: "requestedAt",
      header: "Requested",
      sortable: true,
      render: (issue: MaterialIssue) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(issue.requestedAt)}
          </div>
          {issue.approvedAt && (
            <div className="text-muted-foreground text-xs">
              Approved: {formatDateISO(issue.approvedAt)}
            </div>
          )}
          {issue.issuedAt && (
            <div className="text-muted-foreground text-xs">
              Issued: {formatDateISO(issue.issuedAt)}
            </div>
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
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Picked", label: "Picked" },
        { value: "Issued", label: "Issued" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
  ]

  const actions = (issue: MaterialIssue) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/warehouse/material-issues/${issue.id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {issue.status === "Pending" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => handleApprove(issue)}
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      )}
      {issue.status === "Approved" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700"
          onClick={() => handlePick(issue)}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      )}
      {issue.status === "Picked" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700"
          onClick={() => handleIssue(issue)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === "Pending").length,
    approved: issues.filter(i => i.status === "Approved").length,
    picked: issues.filter(i => i.status === "Picked").length,
    issued: issues.filter(i => i.status === "Issued").length,
  }

  const getActionTitle = () => {
    switch (actionType) {
      case 'approve': return "Approve Material Issue"
      case 'pick': return "Pick Material Issue"
      case 'issue': return "Issue Material"
      default: return "Confirm Action"
    }
  }

  const getActionDescription = () => {
    switch (actionType) {
      case 'approve': return `Are you sure you want to approve material issue ${selectedIssue?.issueNumber}?`
      case 'pick': return `Are you sure you want to pick material issue ${selectedIssue?.issueNumber}?`
      case 'issue': return `Are you sure you want to issue material ${selectedIssue?.issueNumber}? This will create a stock movement and update inventory.`
      default: return ""
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Material Issues</h1>
            <p className="text-muted-foreground">Manage material issue requests for production</p>
          </div>
          <Button onClick={() => router.push("/dashboard/warehouse/material-issues/new")}>
            <Plus />
            New Material Issue
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
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
              <CheckSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Picked</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.picked}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issued</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.issued}</div>
            </CardContent>
          </Card>
        </div>

        {/* Material Issues Table */}
        <UnifiedDataTable
          data={issues}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search material issues..."
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
          onRefresh={fetchMaterialIssues}
          onExport={() => console.log("Export material issues")}
          emptyMessage="No material issues found."
        />

        <ConfirmDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          title={getActionTitle()}
          description={getActionDescription()}
          confirmText={actionType === 'approve' ? 'Approve' : actionType === 'pick' ? 'Pick' : 'Issue'}
          cancelText="Cancel"
          onConfirm={handleActionConfirm}
          variant="default"
        />
      </div>
    </DashboardLayout>
  )
}

