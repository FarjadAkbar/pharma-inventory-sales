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
  Building2, 
  Star,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { suppliersApi } from "@/services"
import type { Supplier } from "@/types/suppliers"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    // Filter suppliers based on search query
    if (!searchQuery.trim()) {
      setFilteredSuppliers(suppliers)
    } else {
      const filtered = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSuppliers(filtered)
    }
  }, [suppliers, searchQuery])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching suppliers...")
      const response = await suppliersApi.getSuppliers()
      console.log("📦 Suppliers API response:", response)

      if (response.status && response.data) {
        // Ensure data is always an array
        const suppliersData = Array.isArray(response.data) ? response.data : [response.data]
        console.log("✅ Suppliers data:", suppliersData)
        setSuppliers(suppliersData)
        setPagination({ page: 1, pages: 1, total: suppliersData.length })
      } else {
        console.log("❌ No suppliers data in response")
      }
    } catch (error) {
      console.error("❌ Failed to fetch suppliers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleDelete = async (supplier: Supplier) => {
    if (confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
      try {
        await suppliersApi.deleteSupplier(supplier.id)
        fetchSuppliers() // Refresh the list
      } catch (error) {
        console.error("Failed to delete supplier:", error)
        alert("Failed to delete supplier. Please try again.")
      }
    }
  }

  const getRatingStars = (rating: string) => {
    const numRating = parseFloat(rating)
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(numRating)
            ? "text-yellow-400 fill-current"
            : i < numRating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ))
  }

  const calculateStats = () => {
    const total = suppliers.length
    const active = suppliers.filter(s => s.approved === 1).length
    const averageRating = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + parseFloat(s.rating), 0) / suppliers.length : 0

    return { total, active, averageRating }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (supplier: Supplier) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {supplier.code}
        </div>
      ),
    },
    {
      key: "name",
      header: "Supplier",
      sortable: true,
      render: (supplier: Supplier) => (
        <div>
          <div className="font-medium">{supplier.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {supplier.address}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      sortable: true,
      render: (supplier: Supplier) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {supplier.contact}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-2">
          <div className="flex">{getRatingStars(supplier.rating)}</div>
          <span className="text-sm font-medium">{supplier.rating}</span>
        </div>
      ),
    },
    {
      key: "approved",
      header: "Status",
      sortable: true,
      render: (supplier: Supplier) => (
        <Badge className={supplier.approved === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {supplier.approved === 1 ? "Approved" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (supplier: Supplier) => (
        <div className="text-sm text-muted-foreground">
          {new Date(supplier.created_at).toLocaleDateString()}
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "approved",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "1", label: "Approved" },
        { value: "0", label: "Pending" },
      ],
    },
  ]

  const actions = (supplier: Supplier) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="MASTER_DATA" action="read">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/suppliers/${supplier.id}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" action="update">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = `/dashboard/suppliers/${supplier.id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="MASTER_DATA" action="delete">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(supplier)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </PermissionGuard>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Suppliers Management</h1>
            <p className="text-muted-foreground">Manage pharmaceutical suppliers and their performance</p>
          </div>
          <PermissionGuard module="MASTER_DATA" action="create">
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => window.location.href = "/dashboard/suppliers/new"}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Suppliers</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Table */}
        <UnifiedDataTable
          data={filteredSuppliers}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search suppliers..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={filterOptions}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: filteredSuppliers.length,
            onPageChange: handlePageChange
          }}
          actions={actions}
          onRefresh={fetchSuppliers}
          onExport={() => console.log("Export suppliers")}
          emptyMessage="No suppliers found. Add your first supplier to get started."
        />
      </div>
    </DashboardLayout>
  )
}

