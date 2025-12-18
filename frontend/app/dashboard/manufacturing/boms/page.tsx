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
  FileText, 
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Package,
  Beaker,
  Activity,
  Target,
  FileCheck
} from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { BOM, BOMFilters } from "@/types/manufacturing"
import { formatDateISO } from "@/lib/utils"

export default function BOMsPage() {
  const [boms, setBOMs] = useState<BOM[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<BOMFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchBOMs()
  }, [searchQuery, filters, pagination.page])

  const fetchBOMs = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBOMs({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setBOMs(response.data.boms || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch BOMs:", error)
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

  const handleDeleteBOM = async (bom: BOM) => {
    if (confirm(`Are you sure you want to delete BOM ${bom.bomNumber}?`)) {
      try {
        const response = await apiService.deleteBOM(bom.id)
        if (response.success) {
          fetchBOMs() // Refresh the list
        } else {
          alert("Failed to delete BOM")
        }
      } catch (error) {
        console.error("Failed to delete BOM:", error)
        alert("Failed to delete BOM")
      }
    }
  }

  const handleApproveBOM = async (bom: BOM) => {
    if (confirm(`Are you sure you want to approve BOM ${bom.bomNumber}?`)) {
      try {
        const response = await apiService.approveBOM(bom.id)
        if (response.success) {
          fetchBOMs() // Refresh the list
        } else {
          alert("Failed to approve BOM")
        }
      } catch (error) {
        console.error("Failed to approve BOM:", error)
        alert("Failed to approve BOM")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case "Approved":
        return <Badge className="bg-blue-100 text-blue-800"><FileCheck className="h-3 w-3 mr-1" />Approved</Badge>
      case "Under Review":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800"><FileText className="h-3 w-3 mr-1" />Draft</Badge>
      case "Obsolete":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Obsolete</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (drugName.includes("Capsule")) return <Beaker className="h-4 w-4" />
    if (drugName.includes("Syrup")) return <Activity className="h-4 w-4" />
    return <Target className="h-4 w-4" />
  }

  const calculateStats = () => {
    const total = boms.length
    const active = boms.filter(bom => bom.status === "Active").length
    const approved = boms.filter(bom => bom.status === "Approved").length
    const draft = boms.filter(bom => bom.status === "Draft").length
    const obsolete = boms.filter(bom => bom.status === "Obsolete").length

    return { total, active, approved, draft, obsolete }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "bomNumber",
      header: "BOM #",
      sortable: true,
      render: (bom: BOM) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {bom.bomNumber}
        </div>
      ),
    },
    {
      key: "drug",
      header: "Drug",
      sortable: true,
      render: (bom: BOM) => (
        <div>
          <div className="flex items-center gap-2">
            {getDrugIcon(bom.drugName)}
            <span className="font-medium">{bom.drugName}</span>
          </div>
          <div className="text-sm text-muted-foreground">{bom.drugCode}</div>
        </div>
      ),
    },
    {
      key: "version",
      header: "Version",
      sortable: true,
      render: (bom: BOM) => (
        <div className="text-center">
          <Badge variant="outline" className="font-mono">v{bom.version}</Badge>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      sortable: true,
      render: (bom: BOM) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{bom.items.length} materials</div>
          <div className="text-xs text-muted-foreground">
            {bom.items.filter(item => item.isCritical).length} critical
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (bom: BOM) => getStatusBadge(bom.status),
    },
    {
      key: "effectiveDate",
      header: "Effective Date",
      sortable: true,
      render: (bom: BOM) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {bom.effectiveDate ? formatDateISO(bom.effectiveDate) : "N/A"}
        </div>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      sortable: true,
      render: (bom: BOM) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {bom.createdByName}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (bom: BOM) => formatDateISO(bom.createdAt),
    },
  ]

  const filterOptions = [
    {
      key: "drugId",
      label: "Drug",
      type: "select" as const,
      options: [
        { value: "1", label: "Paracetamol Tablets" },
        { value: "2", label: "Ibuprofen Tablets" },
        { value: "3", label: "Aspirin Tablets" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Draft", label: "Draft" },
        { value: "Under Review", label: "Under Review" },
        { value: "Approved", label: "Approved" },
        { value: "Active", label: "Active" },
        { value: "Obsolete", label: "Obsolete" },
      ],
    },
    {
      key: "version",
      label: "Version",
      type: "select" as const,
      options: [
        { value: "1", label: "Version 1" },
        { value: "2", label: "Version 2" },
        { value: "3", label: "Version 3" },
      ],
    },
  ]

  const actions = (bom: BOM) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/manufacturing/boms/${bom.id}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/manufacturing/boms/${bom.id}/edit`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {bom.status === "Draft" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700"
          onClick={() => handleApproveBOM(bom)}
        >
          <FileCheck className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteBOM(bom)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bill of Materials</h1>
            <p className="text-muted-foreground">Manage manufacturing recipes and material requirements</p>
          </div>
          <Link href="/dashboard/manufacturing/boms/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus />
              New BOM
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total BOMs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <FileCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obsolete</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.obsolete}</div>
            </CardContent>
          </Card>
        </div>

        {/* BOMs Table */}
        <UnifiedDataTable
          data={boms}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search BOMs..."
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
          onRefresh={fetchBOMs}
          onExport={() => console.log("Export BOMs")}
          emptyMessage="No BOMs found. Create your first BOM to get started."
        />
      </div>
    </DashboardLayout>
  )
}
