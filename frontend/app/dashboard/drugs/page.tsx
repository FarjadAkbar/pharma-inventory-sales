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
  Package, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { Drug, DrugFilters } from "@/types/pharma"
import { formatDateISO } from "@/lib/utils"

export default function DrugsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<DrugFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchDrugs()
  }, [searchQuery, filters, pagination.page])

  const fetchDrugs = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDrugs({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setDrugs(response.data.drugs || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch drugs:", error)
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

  const handleDeleteDrug = async (drug: Drug) => {
    if (confirm(`Are you sure you want to delete ${drug.name}?`)) {
      try {
        const response = await apiService.deleteDrug(drug.id)
        if (response.success) {
          fetchDrugs() // Refresh the list
        } else {
          alert("Failed to delete drug")
        }
      } catch (error) {
        console.error("Failed to delete drug:", error)
        alert("Failed to delete drug")
      }
    }
  }

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case "Under Review":
        return <Badge className="bg-blue-100 text-blue-800"><AlertTriangle className="h-3 w-3 mr-1" />Under Review</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
  }

  const getDosageFormBadge = (dosageForm: string) => {
    const colors = {
      'Tablet': 'bg-blue-100 text-blue-800',
      'Capsule': 'bg-green-100 text-green-800',
      'Syrup': 'bg-purple-100 text-purple-800',
      'Injection': 'bg-red-100 text-red-800',
      'Ointment': 'bg-yellow-100 text-yellow-800',
      'Cream': 'bg-pink-100 text-pink-800',
      'Drops': 'bg-indigo-100 text-indigo-800',
      'Powder': 'bg-gray-100 text-gray-800',
      'Suspension': 'bg-orange-100 text-orange-800',
      'Patch': 'bg-teal-100 text-teal-800',
      'Inhaler': 'bg-cyan-100 text-cyan-800'
    }
    return <Badge className={colors[dosageForm as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{dosageForm}</Badge>
  }

  const calculateStats = () => {
    const total = drugs.length
    const approved = drugs.filter(drug => drug.approvalStatus === "Approved").length
    const pending = drugs.filter(drug => drug.approvalStatus === "Pending").length
    const rejected = drugs.filter(drug => drug.approvalStatus === "Rejected").length

    return { total, approved, pending, rejected }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (drug: Drug) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {drug.code}
        </div>
      ),
    },
    {
      key: "name",
      header: "Drug Name",
      sortable: true,
      render: (drug: Drug) => (
        <div>
          <div className="font-medium">{drug.name}</div>
          <div className="text-sm text-muted-foreground">{drug.formula}</div>
        </div>
      ),
    },
    {
      key: "strength",
      header: "Strength",
      sortable: true,
      render: (drug: Drug) => (
        <div className="text-sm">
          <div className="font-medium">{drug.strength}</div>
          <div className="text-muted-foreground">{drug.dosageForm}</div>
        </div>
      ),
    },
    {
      key: "route",
      header: "Route",
      sortable: true,
      render: (drug: Drug) => (
        <Badge variant="outline">{drug.route}</Badge>
      ),
    },
    {
      key: "approvalStatus",
      header: "Status",
      sortable: true,
      render: (drug: Drug) => getApprovalStatusBadge(drug.approvalStatus),
    },
    {
      key: "therapeuticClass",
      header: "Class",
      sortable: true,
      render: (drug: Drug) => (
        <div className="text-sm text-muted-foreground">
          {drug.therapeuticClass || "N/A"}
        </div>
      ),
    },
    {
      key: "manufacturer",
      header: "Manufacturer",
      sortable: true,
      render: (drug: Drug) => (
        <div className="text-sm">
          {drug.manufacturer || "N/A"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (drug: Drug) => formatDateISO(drug.createdAt),
    },
  ]

  const filterOptions = [
    {
      key: "dosageForm",
      label: "Dosage Form",
      type: "select" as const,
      options: [
        { value: "Tablet", label: "Tablet" },
        { value: "Capsule", label: "Capsule" },
        { value: "Syrup", label: "Syrup" },
        { value: "Injection", label: "Injection" },
        { value: "Ointment", label: "Ointment" },
        { value: "Cream", label: "Cream" },
        { value: "Drops", label: "Drops" },
        { value: "Powder", label: "Powder" },
        { value: "Suspension", label: "Suspension" },
        { value: "Patch", label: "Patch" },
        { value: "Inhaler", label: "Inhaler" },
      ],
    },
    {
      key: "route",
      label: "Route",
      type: "select" as const,
      options: [
        { value: "Oral", label: "Oral" },
        { value: "IV", label: "IV" },
        { value: "IM", label: "IM" },
        { value: "SC", label: "SC" },
        { value: "Topical", label: "Topical" },
        { value: "Inhalation", label: "Inhalation" },
        { value: "Rectal", label: "Rectal" },
        { value: "Vaginal", label: "Vaginal" },
        { value: "Ophthalmic", label: "Ophthalmic" },
        { value: "Otic", label: "Otic" },
        { value: "Nasal", label: "Nasal" },
      ],
    },
    {
      key: "approvalStatus",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Draft", label: "Draft" },
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Rejected", label: "Rejected" },
        { value: "Under Review", label: "Under Review" },
      ],
    },
  ]

  const actions = (drug: Drug) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/drugs/${drug.id}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/drugs/${drug.id}/edit`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteDrug(drug)}
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
            <h1 className="text-3xl font-bold tracking-tight">Drugs Management</h1>
            <p className="text-muted-foreground">Manage pharmaceutical drugs and their specifications</p>
          </div>
          <Link href="/dashboard/drugs/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus />
              Add Drug
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Drugs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Drugs Table */}
        <UnifiedDataTable
          data={drugs}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search drugs..."
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
          onRefresh={fetchDrugs}
          onExport={() => console.log("Export drugs")}
          emptyMessage="No drugs found. Add your first drug to get started."
        />
      </div>
    </DashboardLayout>
  )
}
