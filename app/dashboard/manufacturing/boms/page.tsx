"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  FileText, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Package,
  Beaker,
  Activity,
  Target,
  FileCheck,
  AlertCircle
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

  const handleFilterChange = (key: keyof BOMFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
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
      render: (bom: BOM) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {bom.bomNumber}
        </div>
      ),
    },
    {
      key: "drug",
      header: "Drug",
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
      render: (bom: BOM) => (
        <div className="text-center">
          <Badge variant="outline" className="font-mono">v{bom.version}</Badge>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
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
      render: (bom: BOM) => getStatusBadge(bom.status),
    },
    {
      key: "effectiveDate",
      header: "Effective Date",
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
      render: (bom: BOM) => formatDateISO(bom.createdAt),
    },
  ]

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
              <Plus className="mr-2 h-4 w-4" />
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search BOMs..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Drug</label>
                <Select value={filters.drugId || ""} onValueChange={(value) => handleFilterChange("drugId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Drugs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Paracetamol Tablets</SelectItem>
                    <SelectItem value="2">Ibuprofen Tablets</SelectItem>
                    <SelectItem value="3">Aspirin Tablets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status || ""} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Obsolete">Obsolete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Version</label>
                <Select value={filters.version?.toString() || ""} onValueChange={(value) => handleFilterChange("version", Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Versions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Version 1</SelectItem>
                    <SelectItem value="2">Version 2</SelectItem>
                    <SelectItem value="3">Version 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BOMs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bill of Materials</CardTitle>
            <CardDescription>A comprehensive library of manufacturing recipes and material requirements.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={boms}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search BOMs..."
              actions={[
                {
                  label: "View",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: (bom: BOM) => {
                    window.location.href = `/dashboard/manufacturing/boms/${bom.id}`
                  }
                },
                {
                  label: "Edit",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: (bom: BOM) => {
                    window.location.href = `/dashboard/manufacturing/boms/${bom.id}/edit`
                  }
                },
                {
                  label: "Approve",
                  icon: <FileCheck className="h-4 w-4" />,
                  onClick: handleApproveBOM,
                  hidden: (bom: BOM) => bom.status !== "Draft",
                  variant: "default" as const
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: handleDeleteBOM,
                  variant: "destructive" as const
                }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
