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
  TestTube, 
  Search, 
  Filter,
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
import { apiService } from "@/services/api.service"
import type { QCTest, QCTestFilters } from "@/types/quality-control"
import { formatDateISO } from "@/lib/utils"

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
      const response = await apiService.getQCTests({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setQCTests(response.data.qcTests || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch QC tests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof QCTestFilters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleDeleteQCTest = async (test: QCTest) => {
    if (confirm(`Are you sure you want to delete QC Test ${test.code}?`)) {
      try {
        const response = await apiService.deleteQCTest(test.id)
        if (response.success) {
          fetchQCTests() // Refresh the list
        } else {
          alert("Failed to delete QC test")
        }
      } catch (error) {
        console.error("Failed to delete QC test:", error)
        alert("Failed to delete QC test")
      }
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
      render: (test: QCTest) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {test.code}
        </div>
      ),
    },
    {
      key: "name",
      header: "Test Name",
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
      render: (test: QCTest) => (
        <Badge className={test.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {test.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      render: (test: QCTest) => (
        <div className="text-sm">
          {test.createdByName}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (test: QCTest) => formatDateISO(test.createdAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QC Tests Library</h1>
            <p className="text-muted-foreground">Manage quality control test methods and specifications</p>
          </div>
          <Link href="/dashboard/quality/qc-tests/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={filters.category || ""} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Chemical">Chemical</SelectItem>
                    <SelectItem value="Microbiological">Microbiological</SelectItem>
                    <SelectItem value="Stability">Stability</SelectItem>
                    <SelectItem value="Dissolution">Dissolution</SelectItem>
                    <SelectItem value="Content Uniformity">Content Uniformity</SelectItem>
                    <SelectItem value="Assay">Assay</SelectItem>
                    <SelectItem value="Impurities">Impurities</SelectItem>
                    <SelectItem value="Identification">Identification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.isActive?.toString() || ""} onValueChange={(value) => handleFilterChange("isActive", value === "true")}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QC Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle>QC Tests Library</CardTitle>
            <CardDescription>A comprehensive library of quality control test methods and specifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={qcTests}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search QC tests..."
              actions={[
                {
                  label: "View",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: (test: QCTest) => {
                    window.location.href = `/dashboard/quality/qc-tests/${test.id}`
                  }
                },
                {
                  label: "Edit",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: (test: QCTest) => {
                    window.location.href = `/dashboard/quality/qc-tests/${test.id}/edit`
                  }
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: handleDeleteQCTest,
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
