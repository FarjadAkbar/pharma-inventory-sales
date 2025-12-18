"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Download, FileText, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Export {
  id: string
  exportNumber: string
  name: string
  type: "data" | "report" | "analytics" | "compliance" | "audit"
  format: "csv" | "excel" | "pdf" | "json"
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  requestedBy: string
  requestedByName: string
  requestedAt: string
  completedAt?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  parameters: Record<string, any>
  filters: {
    dateRange?: { start: string; end: string }
    modules?: string[]
    status?: string[]
    [key: string]: any
  }
  recordCount?: number
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export default function ExportsPage() {
  const [exports, setExports] = useState<Export[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchExports()
  }, [searchQuery, pagination.page, filters])

  const fetchExports = async () => {
    try {
      setLoading(true)
      const response = await apiService.getExports({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const exportData = response.data as {
          exports: Export[]
          pagination: { page: number; pages: number; total: number }
        }
        setExports(exportData.exports || [])
        setPagination(exportData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch exports:", error)
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

  const handleEdit = (exportItem: Export) => {
    window.location.href = `/dashboard/reports/exports/${exportItem.id}`
  }

  const handleDelete = async (exportItem: Export) => {
    if (confirm(`Are you sure you want to delete export "${exportItem.exportNumber}"?`)) {
      try {
        await apiService.deleteExport(exportItem.id)
        fetchExports()
      } catch (error) {
        console.error("Failed to delete export:", error)
      }
    }
  }

  const handleDownload = async (exportItem: Export) => {
    if (exportItem.fileUrl) {
      try {
        await apiService.downloadFile(exportItem.fileUrl, exportItem.fileName || `export-${exportItem.exportNumber}.${exportItem.format}`)
      } catch (error) {
        console.error("Failed to download file:", error)
      }
    }
  }

  const handleCancel = async (exportItem: Export) => {
    try {
      await apiService.cancelExport(exportItem.id)
      fetchExports()
    } catch (error) {
      console.error("Failed to cancel export:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "data":
        return "bg-blue-100 text-blue-800"
      case "report":
        return "bg-green-100 text-green-800"
      case "analytics":
        return "bg-purple-100 text-purple-800"
      case "compliance":
        return "bg-orange-100 text-orange-800"
      case "audit":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case "csv":
        return "bg-green-100 text-green-800"
      case "excel":
        return "bg-blue-100 text-blue-800"
      case "pdf":
        return "bg-red-100 text-red-800"
      case "json":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const calculateStats = () => {
    const totalExports = exports.length
    const completedExports = exports.filter(e => e.status === "completed").length
    const pendingExports = exports.filter(e => e.status === "pending" || e.status === "processing").length
    const failedExports = exports.filter(e => e.status === "failed").length

    return { totalExports, completedExports, pendingExports, failedExports }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "export",
      header: "Export",
      render: (exportItem: Export) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {getStatusIcon(exportItem.status)}
          </div>
          <div>
            <div className="font-medium">{exportItem.exportNumber}</div>
            <div className="text-sm text-muted-foreground">{exportItem.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (exportItem: Export) => (
        <Badge className={getTypeBadgeColor(exportItem.type)}>
          {exportItem.type.charAt(0).toUpperCase() + exportItem.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "format",
      header: "Format",
      render: (exportItem: Export) => (
        <Badge className={getFormatBadgeColor(exportItem.format)}>
          {exportItem.format.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (exportItem: Export) => (
        <Badge className={getStatusBadgeColor(exportItem.status)}>
          {exportItem.status.charAt(0).toUpperCase() + exportItem.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "requested",
      header: "Requested By",
      render: (exportItem: Export) => (
        <div className="space-y-1 text-sm">
          <div className="font-medium">{exportItem.requestedByName}</div>
          <div className="text-muted-foreground">{formatDateISO(exportItem.requestedAt)}</div>
        </div>
      ),
    },
    {
      key: "parameters",
      header: "Parameters",
      render: (exportItem: Export) => (
        <div className="space-y-1 text-sm">
          {exportItem.filters.dateRange && (
            <div>Date: {exportItem.filters.dateRange.start} to {exportItem.filters.dateRange.end}</div>
          )}
          {exportItem.filters.modules && exportItem.filters.modules.length > 0 && (
            <div>Modules: {exportItem.filters.modules.join(", ")}</div>
          )}
          {exportItem.recordCount && (
            <div className="font-medium">{exportItem.recordCount.toLocaleString()} records</div>
          )}
        </div>
      ),
    },
    {
      key: "file",
      header: "File",
      render: (exportItem: Export) => (
        <div className="flex items-center gap-2">
          {exportItem.fileUrl ? (
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(exportItem)}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              {exportItem.fileSize && (
                <div className="text-xs text-muted-foreground">
                  {(exportItem.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No file</span>
          )}
        </div>
      ),
    },
    {
      key: "completedAt",
      header: "Completed",
      render: (exportItem: Export) => (
        <div className="text-sm">
          {exportItem.completedAt ? (
            <div>{formatDateISO(exportItem.completedAt)}</div>
          ) : (
            <span className="text-muted-foreground">Not completed</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Data Exports</h1>
            <p className="text-muted-foreground">Manage data exports and report generation</p>
          </div>

          <PermissionGuard module="REPORTING" screen="exports" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/reports/exports/new")}>
              <Plus />
              Create Export
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedExports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingExports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedExports}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter exports by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "data", label: "Data" },
                    { value: "report", label: "Report" },
                    { value: "analytics", label: "Analytics" },
                    { value: "compliance", label: "Compliance" },
                    { value: "audit", label: "Audit" },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={typeFilter === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Status" },
                    { value: "pending", label: "Pending" },
                    { value: "processing", label: "Processing" },
                    { value: "completed", label: "Completed" },
                    { value: "failed", label: "Failed" },
                    { value: "cancelled", label: "Cancelled" },
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exports Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Data Exports</CardTitle>
            <CardDescription>A list of all data exports with their status and download links.</CardDescription>
          </CardHeader>
          <CardContent>
            <UnifiedDataTable
              data={exports}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search exports..."
              actions={(exportItem: Export) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="REPORTING" screen="exports" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(exportItem)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  {(exportItem.status === "pending" || exportItem.status === "processing") && (
                    <PermissionGuard module="REPORTING" screen="exports" action="cancel">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCancel(exportItem)}
                        className="text-red-600"
                      >
                        Cancel
                      </Button>
                    </PermissionGuard>
                  )}
                  <PermissionGuard module="REPORTING" screen="exports" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(exportItem)}>
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
