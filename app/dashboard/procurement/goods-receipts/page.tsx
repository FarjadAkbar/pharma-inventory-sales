"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  ClipboardCheck, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Package,
  FileText,
  TestTube,
  Calendar,
  Building2,
  User
} from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { GoodsReceipt, GRNFilters } from "@/types/procurement"
import { formatDateISO } from "@/lib/utils"

export default function GoodsReceiptsPage() {
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<GRNFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchGoodsReceipts()
  }, [searchQuery, filters, pagination.page])

  const fetchGoodsReceipts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getGoodsReceipts({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setGoodsReceipts(response.data.goodsReceipts || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch goods receipts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof GRNFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleDeleteGoodsReceipt = async (grn: GoodsReceipt) => {
    if (confirm(`Are you sure you want to delete GRN ${grn.grnNumber}?`)) {
      try {
        const response = await apiService.deleteGoodsReceipt(grn.id)
        if (response.success) {
          fetchGoodsReceipts() // Refresh the list
        } else {
          alert("Failed to delete goods receipt")
        }
      } catch (error) {
        console.error("Failed to delete goods receipt:", error)
        alert("Failed to delete goods receipt")
      }
    }
  }

  const handleRequestQCSample = async (grn: GoodsReceipt) => {
    if (confirm(`Are you sure you want to request QC sample for GRN ${grn.grnNumber}?`)) {
      try {
        const response = await apiService.requestQCSample(grn.id)
        if (response.success) {
          fetchGoodsReceipts() // Refresh the list
        } else {
          alert("Failed to request QC sample")
        }
      } catch (error) {
        console.error("Failed to request QC sample:", error)
        alert("Failed to request QC sample")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "QC Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />QC Approved</Badge>
      case "Pending QC":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending QC</Badge>
      case "QC Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />QC Rejected</Badge>
      case "Completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
  }

  const calculateStats = () => {
    const total = goodsReceipts.length
    const pendingQC = goodsReceipts.filter(grn => grn.status === "Pending QC").length
    const qcApproved = goodsReceipts.filter(grn => grn.status === "QC Approved").length
    const completed = goodsReceipts.filter(grn => grn.status === "Completed").length

    return { total, pendingQC, qcApproved, completed }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "grnNumber",
      header: "GRN Number",
      render: (grn: GoodsReceipt) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {grn.grnNumber}
        </div>
      ),
    },
    {
      key: "poReference",
      header: "PO Reference",
      render: (grn: GoodsReceipt) => (
        <div>
          <div className="font-medium">{grn.poNumber}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {grn.siteName}
          </div>
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (grn: GoodsReceipt) => (
        <div>
          <div className="font-medium">{grn.supplierName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(grn.receivedDate)}
          </div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (grn: GoodsReceipt) => (
        <div className="text-sm">
          <div className="font-medium">{grn.items.length} items</div>
          <div className="text-muted-foreground">
            {grn.items.reduce((sum, item) => sum + item.receivedQuantity, 0)} received
          </div>
        </div>
      ),
    },
    {
      key: "qcStatus",
      header: "QC Status",
      render: (grn: GoodsReceipt) => (
        <div className="space-y-1">
          {getStatusBadge(grn.status)}
          {grn.qcSampleRequested && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <TestTube className="h-3 w-3" />
              QC Sample
            </div>
          )}
        </div>
      ),
    },
    {
      key: "documents",
      header: "Documents",
      render: (grn: GoodsReceipt) => (
        <div className="flex items-center gap-2">
          {grn.coaAttached && (
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              CoA
            </Badge>
          )}
          {grn.qcSampleRequested && (
            <Badge variant="outline" className="text-xs">
              <TestTube className="h-3 w-3 mr-1" />
              Sample
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "receivedBy",
      header: "Received By",
      render: (grn: GoodsReceipt) => (
        <div className="text-sm flex items-center gap-1">
          <User className="h-3 w-3" />
          {grn.receivedByName}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (grn: GoodsReceipt) => formatDateISO(grn.createdAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goods Receipts</h1>
            <p className="text-muted-foreground">Manage goods receipts and quality control samples</p>
          </div>
          <Link href="/dashboard/procurement/goods-receipts/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Create GRN
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total GRNs</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending QC</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingQC}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QC Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.qcApproved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
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
                    placeholder="Search GRNs..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">PO Reference</label>
                <Input
                  placeholder="PO Number"
                  value={filters.poId || ""}
                  onChange={(e) => handleFilterChange("poId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status || ""} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending QC">Pending QC</SelectItem>
                    <SelectItem value="QC Approved">QC Approved</SelectItem>
                    <SelectItem value="QC Rejected">QC Rejected</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Site</label>
                <Select value={filters.siteId || ""} onValueChange={(value) => handleFilterChange("siteId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Main Campus</SelectItem>
                    <SelectItem value="2">Clifton</SelectItem>
                    <SelectItem value="3">North Nazimabad</SelectItem>
                    <SelectItem value="4">Korangi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goods Receipts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Goods Receipts List</CardTitle>
            <CardDescription>A comprehensive list of all goods receipts and their QC status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={goodsReceipts}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search goods receipts..."
              actions={[
                {
                  label: "View",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: (grn: GoodsReceipt) => {
                    window.location.href = `/dashboard/procurement/goods-receipts/${grn.id}`
                  }
                },
                {
                  label: "Edit",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: (grn: GoodsReceipt) => {
                    window.location.href = `/dashboard/procurement/goods-receipts/${grn.id}/edit`
                  }
                },
                {
                  label: "Request QC Sample",
                  icon: <TestTube className="h-4 w-4" />,
                  onClick: handleRequestQCSample,
                  hidden: (grn: GoodsReceipt) => grn.status !== "Pending QC" || grn.qcSampleRequested,
                  variant: "default" as const
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: handleDeleteGoodsReceipt,
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
