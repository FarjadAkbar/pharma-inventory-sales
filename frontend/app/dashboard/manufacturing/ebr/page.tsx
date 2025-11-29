"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, CheckCircle, Clock, AlertTriangle, User } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface ElectronicBatchRecord {
  id: string
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
    parameters: Record<string, any>
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
  const [ebrs, setEbrs] = useState<ElectronicBatchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchEbrs()
  }, [searchQuery, pagination.page, statusFilter])

  const fetchEbrs = async () => {
    try {
      setLoading(true)
      const response = await apiService.getElectronicBatchRecords({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const ebrData = response.data as {
          ebrs: ElectronicBatchRecord[]
          pagination: { page: number; pages: number; total: number }
        }
        setEbrs(ebrData.ebrs || [])
        setPagination(ebrData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch electronic batch records:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleEdit = (ebr: ElectronicBatchRecord) => {
    window.location.href = `/dashboard/manufacturing/ebr/${ebr.id}`
  }

  const handleDelete = async (ebr: ElectronicBatchRecord) => {
    if (confirm(`Are you sure you want to delete EBR for batch "${ebr.batchNumber}"?`)) {
      try {
        await apiService.deleteElectronicBatchRecord(ebr.id)
        fetchEbrs()
      } catch (error) {
        console.error("Failed to delete electronic batch record:", error)
      }
    }
  }

  const handleApprove = async (ebr: ElectronicBatchRecord) => {
    if (confirm(`Are you sure you want to approve EBR for batch "${ebr.batchNumber}"?`)) {
      try {
        await apiService.approveElectronicBatchRecord(ebr.id)
        fetchEbrs()
      } catch (error) {
        console.error("Failed to approve electronic batch record:", error)
      }
    }
  }

  const handleReject = async (ebr: ElectronicBatchRecord) => {
    if (confirm(`Are you sure you want to reject EBR for batch "${ebr.batchNumber}"?`)) {
      try {
        await apiService.rejectElectronicBatchRecord(ebr.id)
        fetchEbrs()
      } catch (error) {
        console.error("Failed to reject electronic batch record:", error)
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-purple-100 text-purple-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "in_progress":
        return "text-blue-600"
      case "pending":
        return "text-gray-600"
      case "skipped":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const calculateProgress = (ebr: ElectronicBatchRecord) => {
    const totalSteps = ebr.steps.length
    const completedSteps = ebr.steps.filter(s => s.status === "completed").length
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
  }

  const calculateStats = () => {
    const totalEbrs = ebrs.length
    const inProgressEbrs = ebrs.filter(e => e.status === "in_progress").length
    const completedEbrs = ebrs.filter(e => e.status === "completed").length
    const approvedEbrs = ebrs.filter(e => e.status === "approved").length

    return { totalEbrs, inProgressEbrs, completedEbrs, approvedEbrs }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "batch",
      header: "Batch",
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
      render: (ebr: ElectronicBatchRecord) => (
        <div className="space-y-1 text-sm">
          <div>Planned: {ebr.plannedQuantity} {ebr.unitName}</div>
          <div>Actual: {ebr.actualQuantity || "N/A"} {ebr.unitName}</div>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (ebr: ElectronicBatchRecord) => {
        const progress = calculateProgress(ebr)
        const completedSteps = ebr.steps.filter(s => s.status === "completed").length
        const totalSteps = ebr.steps.length
        
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{completedSteps}/{totalSteps} steps</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  progress === 100 ? "bg-green-500" : "bg-blue-500"
                }`}
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
      render: (ebr: ElectronicBatchRecord) => (
        <div className="space-y-1">
          {ebr.steps.slice(0, 3).map((step) => (
            <div key={step.stepNumber} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">#{step.stepNumber}</span>
              <span className="truncate">{step.stepName}</span>
              <span className={`text-xs ${getStepStatusColor(step.status)}`}>
                {step.status}
              </span>
            </div>
          ))}
          {ebr.steps.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{ebr.steps.length - 3} more steps
            </div>
          )}
        </div>
      ),
    },
    {
      key: "timeline",
      header: "Timeline",
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
      render: (ebr: ElectronicBatchRecord) => (
        <Badge className={getStatusBadgeColor(ebr.status)}>
          {ebr.status.charAt(0).toUpperCase() + ebr.status.slice(1).replace("_", " ")}
        </Badge>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Electronic Batch Records</h1>
            <p className="text-muted-foreground">Manage electronic batch records and manufacturing steps</p>
          </div>

          <PermissionGuard module="MANUFACTURING" screen="ebr" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/manufacturing/ebr/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add EBR
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total EBRs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressEbrs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedEbrs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.approvedEbrs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
            <CardDescription>Select a status to filter electronic batch records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All EBRs" },
                { value: "draft", label: "Draft" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* EBRs Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Electronic Batch Records</CardTitle>
            <CardDescription>A list of all electronic batch records with step progress and status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={ebrs}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search EBRs..."
              actions={(ebr: ElectronicBatchRecord) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="MANUFACTURING" screen="ebr" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(ebr)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  {ebr.status === "completed" && (
                    <>
                      <PermissionGuard module="MANUFACTURING" screen="ebr" action="approve">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleApprove(ebr)}
                          className="text-green-600"
                        >
                          Approve
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard module="MANUFACTURING" screen="ebr" action="reject">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleReject(ebr)}
                          className="text-red-600"
                        >
                          Reject
                        </Button>
                      </PermissionGuard>
                    </>
                  )}
                  <PermissionGuard module="MANUFACTURING" screen="ebr" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(ebr)}>
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
