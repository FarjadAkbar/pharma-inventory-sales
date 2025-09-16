"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileCheck, Download, Eye, AlertTriangle, CheckCircle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface CertificateOfAnalysis {
  id: string
  documentNumber: string
  supplierId: string
  supplierName: string
  materialId: string
  materialName: string
  batchNumber: string
  receivedDate: string
  expiryDate: string
  testResults: {
    parameter: string
    specification: string
    result: string
    unit: string
    status: "pass" | "fail" | "pending"
  }[]
  overallStatus: "approved" | "rejected" | "pending" | "expired"
  approvedBy?: string
  approvedDate?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CertificateOfAnalysisPage() {
  const [coas, setCoas] = useState<CertificateOfAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchCoas()
  }, [searchQuery, pagination.page, statusFilter])

  const fetchCoas = async () => {
    try {
      setLoading(true)
      const response = await apiService.getCertificatesOfAnalysis({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const coaData = response.data as {
          coas: CertificateOfAnalysis[]
          pagination: { page: number; pages: number; total: number }
        }
        setCoas(coaData.coas || [])
        setPagination(coaData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch certificates of analysis:", error)
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

  const handleEdit = (coa: CertificateOfAnalysis) => {
    window.location.href = `/dashboard/procurement/coa/${coa.id}`
  }

  const handleDelete = async (coa: CertificateOfAnalysis) => {
    if (confirm(`Are you sure you want to delete CoA "${coa.documentNumber}"?`)) {
      try {
        await apiService.deleteCertificateOfAnalysis(coa.id)
        fetchCoas()
      } catch (error) {
        console.error("Failed to delete certificate of analysis:", error)
      }
    }
  }

  const handleDownload = async (coa: CertificateOfAnalysis) => {
    if (coa.fileUrl) {
      try {
        await apiService.downloadFile(coa.fileUrl, coa.fileName || `coa-${coa.documentNumber}.pdf`)
      } catch (error) {
        console.error("Failed to download file:", error)
      }
    }
  }

  const handleApprove = async (coa: CertificateOfAnalysis) => {
    if (confirm(`Are you sure you want to approve CoA "${coa.documentNumber}"?`)) {
      try {
        await apiService.approveCertificateOfAnalysis(coa.id)
        fetchCoas()
      } catch (error) {
        console.error("Failed to approve certificate of analysis:", error)
      }
    }
  }

  const handleReject = async (coa: CertificateOfAnalysis) => {
    if (confirm(`Are you sure you want to reject CoA "${coa.documentNumber}"?`)) {
      try {
        await apiService.rejectCertificateOfAnalysis(coa.id)
        fetchCoas()
      } catch (error) {
        console.error("Failed to reject certificate of analysis:", error)
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isCoaExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const isCoaExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const calculateStats = () => {
    const approvedCoas = coas.filter(c => c.overallStatus === "approved").length
    const pendingCoas = coas.filter(c => c.overallStatus === "pending").length
    const rejectedCoas = coas.filter(c => c.overallStatus === "rejected").length
    const expiredCoas = coas.filter(c => isCoaExpired(c.expiryDate)).length

    return { approvedCoas, pendingCoas, rejectedCoas, expiredCoas }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "documentNumber",
      header: "CoA Document",
      render: (coa: CertificateOfAnalysis) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{coa.documentNumber}</div>
            <div className="text-sm text-muted-foreground">Batch: {coa.batchNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (coa: CertificateOfAnalysis) => (
        <div className="text-sm">
          <div className="font-medium">{coa.supplierName}</div>
          <div className="text-muted-foreground">{coa.materialName}</div>
        </div>
      ),
    },
    {
      key: "testResults",
      header: "Test Results",
      render: (coa: CertificateOfAnalysis) => {
        const passCount = coa.testResults.filter(t => t.status === "pass").length
        const failCount = coa.testResults.filter(t => t.status === "fail").length
        const pendingCount = coa.testResults.filter(t => t.status === "pending").length
        
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>{passCount} Pass</span>
            </div>
            {failCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span>{failCount} Fail</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                <span>{pendingCount} Pending</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: "expiryDate",
      header: "Expiry",
      render: (coa: CertificateOfAnalysis) => {
        const isExpired = isCoaExpired(coa.expiryDate)
        const isExpiringSoon = isCoaExpiringSoon(coa.expiryDate)
        
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${
              isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : "text-green-600"
            }`}>
              {formatDateISO(coa.expiryDate)}
            </span>
            {isExpired && <AlertTriangle className="h-3 w-3 text-red-500" />}
            {isExpiringSoon && !isExpired && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
          </div>
        )
      },
    },
    {
      key: "overallStatus",
      header: "Status",
      render: (coa: CertificateOfAnalysis) => (
        <Badge className={getStatusBadgeColor(coa.overallStatus)}>
          {coa.overallStatus.charAt(0).toUpperCase() + coa.overallStatus.slice(1)}
        </Badge>
      ),
    },
    {
      key: "approvedBy",
      header: "Approved By",
      render: (coa: CertificateOfAnalysis) => (
        <div className="text-sm">
          {coa.approvedBy ? (
            <div>
              <div className="font-medium">{coa.approvedBy}</div>
              <div className="text-muted-foreground">{coa.approvedDate ? formatDateISO(coa.approvedDate) : ""}</div>
            </div>
          ) : (
            <span className="text-muted-foreground">Not approved</span>
          )}
        </div>
      ),
    },
    {
      key: "file",
      header: "Document",
      render: (coa: CertificateOfAnalysis) => (
        <div className="flex items-center gap-2">
          {coa.fileUrl ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(coa)}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">No file</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Certificates of Analysis</h1>
            <p className="text-muted-foreground">Manage supplier certificates of analysis and test results</p>
          </div>

          <PermissionGuard module="PROCUREMENT" screen="coa" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/procurement/coa/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add CoA
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CoAs</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedCoas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingCoas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expiredCoas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
            <CardDescription>Select a status to filter certificates of analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All CoAs" },
                { value: "approved", label: "Approved" },
                { value: "pending", label: "Pending" },
                { value: "rejected", label: "Rejected" },
                { value: "expired", label: "Expired" },
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

        {/* CoAs Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Certificates of Analysis</CardTitle>
            <CardDescription>A list of all certificates of analysis with test results and approval status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={coas}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search CoAs..."
              actions={(coa: CertificateOfAnalysis) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="PROCUREMENT" screen="coa" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(coa)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  {coa.overallStatus === "pending" && (
                    <>
                      <PermissionGuard module="PROCUREMENT" screen="coa" action="approve">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleApprove(coa)}
                          className="text-green-600"
                        >
                          Approve
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard module="PROCUREMENT" screen="coa" action="reject">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleReject(coa)}
                          className="text-red-600"
                        >
                          Reject
                        </Button>
                      </PermissionGuard>
                    </>
                  )}
                  <PermissionGuard module="PROCUREMENT" screen="coa" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(coa)}>
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
