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
  ShoppingCart, 
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

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
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
      sortable: true,
      render: (po: PurchaseOrder) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {po.poNumber}
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
      sortable: true,
      render: (po: PurchaseOrder) => getStatusBadge(po.status),
    },
    {
      key: "createdBy",
      header: "Created By",
      sortable: true,
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
      sortable: true,
      render: (po: PurchaseOrder) => formatDateISO(po.createdAt),
    },
  ]

  const filterOptions = [
    {
      key: "supplierId",
      label: "Supplier",
      type: "select" as const,
      options: [
        { value: "1", label: "MediChem Supplies" },
        { value: "2", label: "PharmaExcipients Ltd" },
        { value: "3", label: "Global Pharma Ingredients" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "Draft", label: "Draft" },
        { value: "Pending Approval", label: "Pending Approval" },
        { value: "Approved", label: "Approved" },
        { value: "Partially Received", label: "Partially Received" },
        { value: "Fully Received", label: "Fully Received" },
        { value: "Cancelled", label: "Cancelled" },
        { value: "Rejected", label: "Rejected" },
      ],
    },
    {
      key: "siteId",
      label: "Site",
      type: "select" as const,
      options: [
        { value: "1", label: "Main Campus" },
        { value: "2", label: "Clifton" },
        { value: "3", label: "North Nazimabad" },
        { value: "4", label: "Korangi" },
      ],
    },
  ]

  const actions = (po: PurchaseOrder) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/procurement/purchase-orders/${po.id}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/procurement/purchase-orders/${po.id}/edit`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {po.status === "Pending Approval" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleApprovePurchaseOrder(po)}
          className="text-green-600 hover:text-green-700"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeletePurchaseOrder(po)}
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

        {/* Purchase Orders Table */}
        <UnifiedDataTable
          data={purchaseOrders}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search purchase orders..."
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
          onRefresh={fetchPurchaseOrders}
          onExport={() => console.log("Export purchase orders")}
          emptyMessage="No purchase orders found. Create your first purchase order to get started."
        />
      </div>
    </DashboardLayout>
  )
}
