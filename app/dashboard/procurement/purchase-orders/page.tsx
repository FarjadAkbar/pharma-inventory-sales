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
  ShoppingCart, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Building2,
  User
} from "lucide-react"
import Link from "next/link"
import { apiService } from "@/services/api.service"
import type { PurchaseOrder, POFilters } from "@/types/procurement"
import { formatDateISO } from "@/lib/utils"

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<POFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchPurchaseOrders()
  }, [searchQuery, filters, pagination.page])

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPurchaseOrders({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setPurchaseOrders(response.data.purchaseOrders || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof POFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleDeletePurchaseOrder = async (po: PurchaseOrder) => {
    if (confirm(`Are you sure you want to delete Purchase Order ${po.poNumber}?`)) {
      try {
        const response = await apiService.deletePurchaseOrder(po.id)
        if (response.success) {
          fetchPurchaseOrders() // Refresh the list
        } else {
          alert("Failed to delete purchase order")
        }
      } catch (error) {
        console.error("Failed to delete purchase order:", error)
        alert("Failed to delete purchase order")
      }
    }
  }

  const handleApprovePurchaseOrder = async (po: PurchaseOrder) => {
    if (confirm(`Are you sure you want to approve Purchase Order ${po.poNumber}?`)) {
      try {
        const response = await apiService.approvePurchaseOrder(po.id)
        if (response.success) {
          fetchPurchaseOrders() // Refresh the list
        } else {
          alert("Failed to approve purchase order")
        }
      } catch (error) {
        console.error("Failed to approve purchase order:", error)
        alert("Failed to approve purchase order")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Pending Approval":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>
      case "Partially Received":
        return <Badge className="bg-blue-100 text-blue-800"><AlertTriangle className="h-3 w-3 mr-1" />Partially Received</Badge>
      case "Fully Received":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Fully Received</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
  }

  const calculateStats = () => {
    const total = purchaseOrders.length
    const draft = purchaseOrders.filter(po => po.status === "Draft").length
    const pendingApproval = purchaseOrders.filter(po => po.status === "Pending Approval").length
    const approved = purchaseOrders.filter(po => po.status === "Approved").length
    const totalValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0)

    return { total, draft, pendingApproval, approved, totalValue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "poNumber",
      header: "PO Number",
      render: (po: PurchaseOrder) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {po.poNumber}
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (po: PurchaseOrder) => (
        <div>
          <div className="font-medium">{po.supplierName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {po.siteName}
          </div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (po: PurchaseOrder) => (
        <div className="text-sm">
          <div className="font-medium">{po.items.length} items</div>
          <div className="text-muted-foreground">
            {po.items.reduce((sum, item) => sum + item.quantity, 0)} total qty
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (po: PurchaseOrder) => (
        <div className="text-sm">
          <div className="font-medium flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {po.totalAmount.toLocaleString()} {po.currency}
          </div>
        </div>
      ),
    },
    {
      key: "expectedDate",
      header: "Expected Date",
      render: (po: PurchaseOrder) => (
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDateISO(po.expectedDate)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (po: PurchaseOrder) => getStatusBadge(po.status),
    },
    {
      key: "createdBy",
      header: "Created By",
      render: (po: PurchaseOrder) => (
        <div className="text-sm flex items-center gap-1">
          <User className="h-3 w-3" />
          {po.createdByName}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (po: PurchaseOrder) => formatDateISO(po.createdAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage pharmaceutical purchase orders and procurement</p>
          </div>
          <Link href="/dashboard/procurement/purchase-orders/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Create PO
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</div>
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
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalValue.toLocaleString()} PKR
              </div>
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
                    placeholder="Search POs..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Select value={filters.supplierId || ""} onValueChange={(value) => handleFilterChange("supplierId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">MediChem Supplies</SelectItem>
                    <SelectItem value="2">PharmaExcipients Ltd</SelectItem>
                    <SelectItem value="3">Global Pharma Ingredients</SelectItem>
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
                    <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Partially Received">Partially Received</SelectItem>
                    <SelectItem value="Fully Received">Fully Received</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
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

        {/* Purchase Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders List</CardTitle>
            <CardDescription>A comprehensive list of all purchase orders in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={purchaseOrders}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search purchase orders..."
              actions={[
                {
                  label: "View",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: (po: PurchaseOrder) => {
                    window.location.href = `/dashboard/procurement/purchase-orders/${po.id}`
                  }
                },
                {
                  label: "Edit",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: (po: PurchaseOrder) => {
                    window.location.href = `/dashboard/procurement/purchase-orders/${po.id}/edit`
                  }
                },
                {
                  label: "Approve",
                  icon: <CheckCircle className="h-4 w-4" />,
                  onClick: handleApprovePurchaseOrder,
                  hidden: (po: PurchaseOrder) => po.status !== "Pending Approval",
                  variant: "default" as const
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: handleDeletePurchaseOrder,
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
