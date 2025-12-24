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
  TestTube, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Beaker,
  Microscope,
  Activity,
  Target
} from "lucide-react"
import Link from "next/link"
import { qualityControlApi } from "@/services"
import type { QCTest, QCTestFilters } from "@/types/quality-control"
import { formatDateISO } from "@/lib/utils"
import { toast } from "@/lib/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function QCTestsPage() {
  const [qcTests, setQCTests] = useState<QCTest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<QCTestFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchQCTests()
  }, [searchQuery, filters, pagination.page])

  const fetchQCTests = async () => {
    try {
      setLoading(true)
      const response = await qualityControlApi.getQCTests({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })
      setQCTests(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error("Failed to fetch QC tests:", error)
      toast.error("Failed to fetch QC tests", "Please try again later.")
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<QCTest | null>(null)

  const handleDeleteClick = (test: QCTest) => {
    setTestToDelete(test)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!testToDelete) return
    
    try {
      await qualityControlApi.deleteQCTest(testToDelete.id?.toString() || "")
      toast.success("QC test deleted successfully", `Test ${testToDelete.code} has been deleted.`)
      fetchQCTests()
    } catch (error) {
      console.error("Failed to delete QC test:", error)
      toast.error("Failed to delete QC test", "Please try again later.")
    } finally {
      setDeleteDialogOpen(false)
      setTestToDelete(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Physical":
        return <Beaker className="h-4 w-4" />
      case "Chemical":
        return <TestTube className="h-4 w-4" />
      case "Microbiological":
        return <Microscope className="h-4 w-4" />
      case "Stability":
        return <Clock className="h-4 w-4" />
      case "Dissolution":
        return <Activity className="h-4 w-4" />
      case "Content Uniformity":
        return <Target className="h-4 w-4" />
      case "Assay":
        return <CheckCircle className="h-4 w-4" />
      case "Impurities":
        return <AlertTriangle className="h-4 w-4" />
      case "Identification":
        return <Eye className="h-4 w-4" />
      default:
        return <TestTube className="h-4 w-4" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Physical': 'bg-blue-100 text-blue-800',
      'Chemical': 'bg-green-100 text-green-800',
      'Microbiological': 'bg-purple-100 text-purple-800',
      'Stability': 'bg-yellow-100 text-yellow-800',
      'Dissolution': 'bg-orange-100 text-orange-800',
      'Content Uniformity': 'bg-pink-100 text-pink-800',
      'Assay': 'bg-indigo-100 text-indigo-800',
      'Impurities': 'bg-red-100 text-red-800',
      'Identification': 'bg-gray-100 text-gray-800'
    }
    return <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{category}</Badge>
  }

  const calculateStats = () => {
    const total = qcTests.length
    const active = qcTests.filter(test => test.isActive).length
    const physical = qcTests.filter(test => test.category === "Physical").length
    const chemical = qcTests.filter(test => test.category === "Chemical").length

    return { total, active, physical, chemical }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "code",
      header: "Test Code",
      sortable: true,
      render: (test: QCTest) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {test.code}
        </div>
      ),
    },
    {
      key: "name",
      header: "Test Name",
      sortable: true,
      render: (test: QCTest) => (
        <div>
          <div className="font-medium">{test.name}</div>
          <div className="text-sm text-muted-foreground">{test.description}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (test: QCTest) => (
        <div className="flex items-center gap-2">
          {getCategoryIcon(test.category)}
          {getCategoryBadge(test.category)}
        </div>
      ),
    },
    {
      key: "method",
      header: "Method",
      sortable: true,
      render: (test: QCTest) => (
        <div className="text-sm">
          <div className="font-medium">{test.method}</div>
          <div className="text-muted-foreground">{test.unit}</div>
        </div>
      ),
    },
    {
      key: "specifications",
      header: "Specifications",
      sortable: true,
      render: (test: QCTest) => (
        <div className="text-sm">
          <div className="font-medium">{test.specifications.length} parameters</div>
          <div className="text-muted-foreground">
            {test.specifications.slice(0, 2).map(spec => spec.parameter).join(", ")}
            {test.specifications.length > 2 && "..."}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (test: QCTest) => (
        <Badge className={test.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {test.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      sortable: true,
      render: (test: QCTest) => (
        <div className="text-sm">
          {test.createdByName}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (test: QCTest) => formatDateISO(test.createdAt),
    },
  ]

  const filterOptions = [
    {
      key: "category",
      label: "Category",
      type: "select" as const,
      options: [
        { value: "Physical", label: "Physical" },
        { value: "Chemical", label: "Chemical" },
        { value: "Microbiological", label: "Microbiological" },
        { value: "Stability", label: "Stability" },
        { value: "Dissolution", label: "Dissolution" },
        { value: "Content Uniformity", label: "Content Uniformity" },
        { value: "Assay", label: "Assay" },
        { value: "Impurities", label: "Impurities" },
        { value: "Identification", label: "Identification" },
      ],
    },
    {
      key: "isActive",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ]

  const actions = (test: QCTest) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/quality/qc-tests/${test.id}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/quality/qc-tests/${test.id}/edit`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteClick(test)}
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
            <h1 className="text-3xl font-bold tracking-tight">QC Tests Library</h1>
            <p className="text-muted-foreground">Manage quality control test methods and specifications</p>
          </div>
          <Link href="/dashboard/quality/qc-tests/new">
            <Button>
              <Plus />
              Add Test Method
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Physical Tests</CardTitle>
              <Beaker className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.physical}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chemical Tests</CardTitle>
              <TestTube className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.chemical}</div>
            </CardContent>
          </Card>
        </div>

        {/* QC Tests Table */}
        <UnifiedDataTable
          data={qcTests}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search QC tests..."
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
          onRefresh={fetchQCTests}
          onExport={() => console.log("Export QC tests")}
          emptyMessage="No QC tests found. Add your first test method to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete QC Test"
          description={`Are you sure you want to delete QC Test ${testToDelete?.code}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}
