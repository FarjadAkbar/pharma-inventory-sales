"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Download, Eye, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface RegulatoryDocument {
  id: string
  documentNumber: string
  title: string
  type: "license" | "permit" | "certificate" | "approval" | "registration" | "compliance" | "policy"
  category: string
  issuingAuthority: string
  status: "draft" | "pending" | "approved" | "rejected" | "expired" | "renewed"
  issueDate: string
  expiryDate: string
  renewalDate?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  version: string
  description: string
  requirements: string[]
  complianceStatus: "compliant" | "non_compliant" | "pending_review"
  assignedTo?: string
  assignedToName?: string
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export default function RegulatoryDocumentsPage() {
  const [documents, setDocuments] = useState<RegulatoryDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchDocuments()
  }, [searchQuery, pagination.page, typeFilter, statusFilter])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRegulatoryDocuments({
        search: searchQuery,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const documentData = response.data as {
          documents: RegulatoryDocument[]
          pagination: { page: number; pages: number; total: number }
        }
        setDocuments(documentData.documents || [])
        setPagination(documentData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch regulatory documents:", error)
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

  const handleEdit = (document: RegulatoryDocument) => {
    window.location.href = `/dashboard/regulatory/documents/${document.id}`
  }

  const handleDelete = async (document: RegulatoryDocument) => {
    if (confirm(`Are you sure you want to delete document "${document.documentNumber}"?`)) {
      try {
        await apiService.deleteRegulatoryDocument(document.id)
        fetchDocuments()
      } catch (error) {
        console.error("Failed to delete regulatory document:", error)
      }
    }
  }

  const handleDownload = async (document: RegulatoryDocument) => {
    if (document.fileUrl) {
      try {
        await apiService.downloadFile(document.fileUrl, document.fileName || `document-${document.documentNumber}.pdf`)
      } catch (error) {
        console.error("Failed to download file:", error)
      }
    }
  }

  const handleApprove = async (document: RegulatoryDocument) => {
    try {
      await apiService.approveRegulatoryDocument(document.id)
      fetchDocuments()
    } catch (error) {
      console.error("Failed to approve regulatory document:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "license":
        return "bg-blue-100 text-blue-800"
      case "permit":
        return "bg-green-100 text-green-800"
      case "certificate":
        return "bg-purple-100 text-purple-800"
      case "approval":
        return "bg-orange-100 text-orange-800"
      case "registration":
        return "bg-yellow-100 text-yellow-800"
      case "compliance":
        return "bg-red-100 text-red-800"
      case "policy":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "renewed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getComplianceBadgeColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800"
      case "non_compliant":
        return "bg-red-100 text-red-800"
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isDocumentExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isDocumentExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const calculateStats = () => {
    const totalDocuments = documents.length
    const approvedDocuments = documents.filter(d => d.status === "approved").length
    const expiringDocuments = documents.filter(d => isDocumentExpiringSoon(d.expiryDate)).length
    const expiredDocuments = documents.filter(d => isDocumentExpired(d.expiryDate)).length

    return { totalDocuments, approvedDocuments, expiringDocuments, expiredDocuments }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "document",
      header: "Document",
      render: (document: RegulatoryDocument) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{document.documentNumber}</div>
            <div className="text-sm text-muted-foreground">{document.title}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (document: RegulatoryDocument) => (
        <Badge className={getTypeBadgeColor(document.type)}>
          {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "authority",
      header: "Issuing Authority",
      render: (document: RegulatoryDocument) => (
        <div className="text-sm">
          <div className="font-medium">{document.issuingAuthority}</div>
          <div className="text-muted-foreground">{document.category}</div>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (document: RegulatoryDocument) => {
        const isExpired = isDocumentExpired(document.expiryDate)
        const isExpiringSoon = isDocumentExpiringSoon(document.expiryDate)
        
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>Issued: {formatDateISO(document.issueDate)}</span>
            </div>
            <div className={`flex items-center gap-2 ${
              isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : "text-green-600"
            }`}>
              <span>Expires: {formatDateISO(document.expiryDate)}</span>
              {isExpired && <AlertTriangle className="h-3 w-3" />}
              {isExpiringSoon && !isExpired && <AlertTriangle className="h-3 w-3" />}
            </div>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (document: RegulatoryDocument) => (
        <div className="space-y-1">
          <Badge className={getStatusBadgeColor(document.status)}>
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Badge>
          <Badge className={getComplianceBadgeColor(document.complianceStatus)}>
            {document.complianceStatus.charAt(0).toUpperCase() + document.complianceStatus.slice(1).replace("_", " ")}
          </Badge>
        </div>
      ),
    },
    {
      key: "version",
      header: "Version",
      render: (document: RegulatoryDocument) => (
        <div className="text-sm">
          <div className="font-medium">v{document.version}</div>
        </div>
      ),
    },
    {
      key: "assigned",
      header: "Assigned To",
      render: (document: RegulatoryDocument) => (
        <div className="text-sm">
          {document.assignedToName ? (
            <div>
              <div className="font-medium">{document.assignedToName}</div>
              {document.reviewedByName && (
                <div className="text-muted-foreground">Reviewed: {document.reviewedByName}</div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "file",
      header: "Document",
      render: (document: RegulatoryDocument) => (
        <div className="flex items-center gap-2">
          {document.fileUrl ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(document)}
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
            <h1 className="text-3xl font-bold tracking-tight">Regulatory Documents</h1>
            <p className="text-muted-foreground">Manage regulatory documents and compliance</p>
          </div>

          <PermissionGuard module="REGULATORY" screen="documents" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/regulatory/documents/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
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
              <div className="text-2xl font-bold text-green-600">{stats.approvedDocuments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.expiringDocuments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expiredDocuments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter documents by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "license", label: "License" },
                    { value: "permit", label: "Permit" },
                    { value: "certificate", label: "Certificate" },
                    { value: "approval", label: "Approval" },
                    { value: "registration", label: "Registration" },
                    { value: "compliance", label: "Compliance" },
                    { value: "policy", label: "Policy" },
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
                    { value: "draft", label: "Draft" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "expired", label: "Expired" },
                    { value: "renewed", label: "Renewed" },
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

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Regulatory Documents</CardTitle>
            <CardDescription>A list of all regulatory documents with their compliance status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={documents}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search documents..."
              actions={(document: RegulatoryDocument) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="REGULATORY" screen="documents" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(document)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  {document.status === "pending" && (
                    <PermissionGuard module="REGULATORY" screen="documents" action="approve">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleApprove(document)}
                        className="text-green-600"
                      >
                        Approve
                      </Button>
                    </PermissionGuard>
                  )}
                  <PermissionGuard module="REGULATORY" screen="documents" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(document)}>
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
