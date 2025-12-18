"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, TrendingUp, Star, MapPin, Phone, Mail } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Distributor {
  id: string
  name: string
  code: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  rating: number
  performance: {
    onTimeDelivery: number
    qualityScore: number
    responseTime: number
  }
  contractStatus: "active" | "expired" | "pending" | "terminated"
  contractStartDate: string
  contractEndDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchDistributors()
  }, [searchQuery, pagination.page, filters])

  const fetchDistributors = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDistributors({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const distributorData = response.data as {
          distributors: Distributor[]
          pagination: { page: number; pages: number; total: number }
        }
        setDistributors(distributorData.distributors || [])
        setPagination(distributorData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch distributors:", error)
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

  const handleEdit = (distributor: Distributor) => {
    window.location.href = `/dashboard/distributors/${distributor.id}`
  }

  const handleDelete = async (distributor: Distributor) => {
    if (confirm(`Are you sure you want to delete distributor "${distributor.name}"?`)) {
      try {
        await apiService.deleteDistributor(distributor.id)
        fetchDistributors()
      } catch (error) {
        console.error("Failed to delete distributor:", error)
      }
    }
  }

  const handleToggleStatus = async (distributor: Distributor) => {
    try {
      await apiService.updateDistributor(distributor.id, { isActive: !distributor.isActive })
      fetchDistributors()
    } catch (error) {
      console.error("Failed to toggle distributor status:", error)
    }
  }

  const getContractStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "terminated":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ))
  }

  const calculateStats = () => {
    const activeDistributors = distributors.filter(d => d.isActive).length
    const activeContracts = distributors.filter(d => d.contractStatus === "active").length
    const expiredContracts = distributors.filter(d => d.contractStatus === "expired").length
    const avgRating = distributors.length > 0 
      ? (distributors.reduce((sum, d) => sum + d.rating, 0) / distributors.length).toFixed(1)
      : "0.0"

    return { activeDistributors, activeContracts, expiredContracts, avgRating }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Distributor",
      sortable: true,
      render: (distributor: Distributor) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{distributor.name}</div>
            <div className="text-sm text-muted-foreground">{distributor.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      sortable: true,
      render: (distributor: Distributor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{distributor.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{distributor.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (distributor: Distributor) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{distributor.city}, {distributor.state}</span>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (distributor: Distributor) => (
        <div className="flex items-center gap-2">
          <div className="flex">{getRatingStars(distributor.rating)}</div>
          <span className="text-sm font-medium">{distributor.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: "performance",
      header: "Performance",
      sortable: true,
      render: (distributor: Distributor) => (
        <div className="space-y-1 text-sm">
          <div>OTD: {distributor.performance.onTimeDelivery}%</div>
          <div>Quality: {distributor.performance.qualityScore}%</div>
        </div>
      ),
    },
    {
      key: "contractStatus",
      header: "Contract",
      sortable: true,
      render: (distributor: Distributor) => (
        <Badge className={getContractStatusBadgeColor(distributor.contractStatus)}>
          {distributor.contractStatus.charAt(0).toUpperCase() + distributor.contractStatus.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (distributor: Distributor) => (
        <Badge variant={distributor.isActive ? "default" : "secondary"}>
          {distributor.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      key: "contractStatus",
      label: "Contract Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "expired", label: "Expired" },
        { value: "pending", label: "Pending" },
        { value: "terminated", label: "Terminated" },
      ],
    },
  ]

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const actions = (distributor: Distributor) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="MASTER_DATA" screen="distributors" action="update">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(distributor)}>
          Edit
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="distributors" action="update">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleToggleStatus(distributor)}
        >
          {distributor.isActive ? "Deactivate" : "Activate"}
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" screen="distributors" action="delete">
        <Button variant="ghost" size="sm" onClick={() => handleDelete(distributor)}>
          Delete
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Distributors</h1>
            <p className="text-muted-foreground">Manage distributor relationships and performance</p>
          </div>

          <PermissionGuard module="MASTER_DATA" screen="distributors" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/distributors/new")}>
              <Plus />
              Add Distributor
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distributors</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Distributors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeDistributors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeContracts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
            </CardContent>
          </Card>
        </div>

        {/* Distributors Table */}
        <UnifiedDataTable
          data={distributors}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search distributors..."
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
          onRefresh={fetchDistributors}
          onExport={() => console.log("Export distributors")}
          emptyMessage="No distributors found. Add your first distributor to get started."
        />
      </div>
    </DashboardLayout>
  )
}
