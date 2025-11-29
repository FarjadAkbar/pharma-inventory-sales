"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
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
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchDocuments()
  }, [searchQuery, pagination.page, filters])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRegulatoryDocuments({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setDocuments(response.data.documents || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
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

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (document: RegulatoryDocument) => {
    console.log("View document:", document)
  }

  const handleEdit = (document: RegulatoryDocument) => {
    console.log("Edit document:", document)
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
      sortable: true,
      render: (document: RegulatoryDocument) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{document.title}</div>
            <div className="text-sm text-muted-foreground">{document.documentNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (document: RegulatoryDocument) => (
        <Badge className={getTypeBadgeColor(document.type)}>
          {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "issuingAuthority",
      header: "Issuing Authority",
      sortable: true,
      render: (document: RegulatoryDocument) => (
        <div className="text-sm">
          <div className="font-medium">{document.issuingAuthority}</div>
          <div className="text-muted-foreground">{document.category}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (document: RegulatoryDocument) => (
        <div className="space-y-1">
          <Badge className={getStatusBadgeColor(document.status)}>
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Badge>
          <Badge className={getComplianceBadgeColor(document.complianceStatus)}>
            {document.complianceStatus.replace("_", " ").charAt(0).toUpperCase() + document.complianceStatus.replace("_", " ").slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      sortable: true,
      render: (document: RegulatoryDocument) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Issue: {formatDateISO(document.issueDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className={isDocumentExpired(document.expiryDate) ? "text-red-600" : isDocumentExpiringSoon(document.expiryDate) ? "text-yellow-600" : ""}>
              Expiry: {formatDateISO(document.expiryDate)}
            </span>
          </div>
          {document.renewalDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Renewal: {formatDateISO(document.renewalDate)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      sortable: true,
      render: (document: RegulatoryDocument) => (
        <div className="text-sm">
          {document.assignedToName ? (
            <div className="font-medium">{document.assignedToName}</div>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "version",
      header: "Version",
      sortable: true,
      render: (document: RegulatoryDocument) => (
        <div className="text-sm">
          <div className="font-medium">v{document.version}</div>
          <div className="text-muted-foreground">
            {document.fileSize ? `${(document.fileSize / 1024).toFixed(1)} KB` : "No file"}
          </div>
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "type",
      label: "Type",
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
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "draft", label: "Draft" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "expired", label: "Expired" },
        { value: "renewed", label: "Renewed" },
      ],
    },
  ]

  const actions = (document: RegulatoryDocument) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="REGULATORY" screen="documents" action="view">
        <Button variant="ghost" size="sm" onClick={() => handleView(document)}>
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
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
            className="text-green-600 hover:text-green-700"
          >
            Approve
          </Button>
        </PermissionGuard>
      )}
      {document.fileUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDownload(document)}
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

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

        {/* Documents Table */}
        <UnifiedDataTable
          data={documents}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search documents..."
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
          onRefresh={fetchDocuments}
          onExport={() => console.log("Export documents")}
          emptyMessage="No regulatory documents found. Add your first document to get started."
        />
      </div>
    </DashboardLayout>
  )
}