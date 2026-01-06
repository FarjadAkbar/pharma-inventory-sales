"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShoppingCart, 
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
  AlertCircle,
  Play,
  RotateCcw,
  DollarSign,
  MapPin
} from "lucide-react"
import { apiService } from "@/services/api.service"
import { SalesOrderForm } from "@/components/sales/sales-order-form"
import { toast } from "sonner"
import type { SalesOrder, SalesOrderFilters } from "@/types/distribution"
import { formatDateISO } from "@/lib/utils"

export default function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SalesOrderFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchSalesOrders()
  }, [searchQuery, filters, pagination.page])

  const fetchSalesOrders = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSalesOrders({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setSalesOrders(response.data.salesOrders || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch sales orders:", error)
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

  const handleView = (order: SalesOrder) => {
    console.log("View order:", order)
    // TODO: Implement view order functionality
  }

  const handleEdit = (order: SalesOrder) => {
    console.log("Edit order:", order)
    // TODO: Implement edit order functionality
  }

  const handleApprove = async (order: SalesOrder) => {
    try {
      // TODO: Get actual user ID from auth context
      const approvedBy = 1; // Placeholder
      const response = await apiService.approveSalesOrder(order.id, approvedBy)
      
      if (response.success) {
        toast.success("Order approved successfully")
        fetchSalesOrders()
      } else {
        toast.error("Failed to approve order")
      }
    } catch (error) {
      console.error("Error approving order:", error)
      toast.error("Failed to approve order")
    }
  }

  const handleProcess = async (order: SalesOrder) => {
    try {
      const response = await apiService.updateSalesOrder(order.id, {
        ...order,
        status: "In Progress"
      })
      
      if (response.success) {
        toast.success("Order processing started")
        fetchSalesOrders()
      } else {
        toast.error("Failed to start processing")
      }
    } catch (error) {
      console.error("Error processing order:", error)
      toast.error("Failed to start processing")
    }
  }

  const handleDelete = async (order: SalesOrder) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await apiService.deleteSalesOrder(order.id)
        
        if (response.success) {
          toast.success("Order deleted successfully")
          fetchSalesOrders()
        } else {
          toast.error("Failed to delete order")
        }
      } catch (error) {
        console.error("Error deleting order:", error)
        toast.error("Failed to delete order")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case "Shipped":
        return <Badge className="bg-blue-100 text-blue-800"><Package className="h-3 w-3 mr-1" />Shipped</Badge>
      case "In Progress":
        return <Badge className="bg-orange-100 text-orange-800"><Play className="h-3 w-3 mr-1" />In Progress</Badge>
      case "Allocated":
        return <Badge className="bg-purple-100 text-purple-800"><CheckCircle className="h-3 w-3 mr-1" />Allocated</Badge>
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Pending Approval":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800"><Edit className="h-3 w-3 mr-1" />Draft</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case "Returned":
        return <Badge className="bg-red-100 text-red-800"><RotateCcw className="h-3 w-3 mr-1" />Returned</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Emergency":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Emergency</Badge>
      case "Urgent":
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />Urgent</Badge>
      case "High":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />High</Badge>
      case "Normal":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Normal</Badge>
      case "Low":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
    }
  }

  const getDrugIcon = (drugName: string) => {
    if (drugName.includes("Tablet")) return <Package className="h-4 w-4" />
    if (drugName.includes("Capsule")) return <Package className="h-4 w-4" />
    if (drugName.includes("Syrup")) return <Package className="h-4 w-4" />
    return <Package className="h-4 w-4" />
  }

  const calculateStats = () => {
    const total = salesOrders.length
    const pending = salesOrders.filter(order => order.status === "Pending Approval").length
    const approved = salesOrders.filter(order => order.status === "Approved").length
    const inProgress = salesOrders.filter(order => order.status === "In Progress").length
    const shipped = salesOrders.filter(order => order.status === "Shipped").length
    const delivered = salesOrders.filter(order => order.status === "Delivered").length
    const cancelled = salesOrders.filter(order => order.status === "Cancelled").length

    return { total, pending, approved, inProgress, shipped, delivered, cancelled }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "orderNumber",
      header: "Order #",
      sortable: true,
      render: (order: SalesOrder) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {order.orderNumber}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      render: (order: SalesOrder) => (
        <div>
          <div className="font-medium">{order.accountName}</div>
          <div className="text-sm text-muted-foreground">{order.accountCode}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      sortable: true,
      render: (order: SalesOrder) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{order.items.length} items</div>
          <div className="text-xs text-muted-foreground">
            {order.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} units
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (order: SalesOrder) => (
        <div className="text-sm">
          <div className="font-medium flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {order.totalAmount.toLocaleString()} {order.currency}
          </div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (order: SalesOrder) => getPriorityBadge(order.priority),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (order: SalesOrder) => getStatusBadge(order.status),
    },
    {
      key: "dates",
      header: "Dates",
      sortable: true,
      render: (order: SalesOrder) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Requested: {formatDateISO(order.requestedShipDate)}
          </div>
          {order.actualShipDate && (
            <div className="text-muted-foreground">
              Shipped: {formatDateISO(order.actualShipDate)}
            </div>
          )}
          {order.deliveryDate && (
            <div className="text-muted-foreground">
              Delivered: {formatDateISO(order.deliveryDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "shipping",
      header: "Shipping",
      sortable: true,
      render: (order: SalesOrder) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {order.shippingAddress.city}
          </div>
          <div className="text-muted-foreground">
            {order.shippingAddress.state}
          </div>
        </div>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      sortable: true,
      render: (order: SalesOrder) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {order.createdByName}
          </div>
          <div className="text-muted-foreground">
            {formatDateISO(order.createdAt)}
          </div>
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "accountId",
      label: "Customer",
      type: "select" as const,
      options: [
        { value: "1", label: "Ziauddin Hospital - Clifton" },
        { value: "2", label: "Aga Khan University Hospital" },
        { value: "3", label: "Liaquat National Hospital" },
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
        { value: "In Progress", label: "In Progress" },
        { value: "Allocated", label: "Allocated" },
        { value: "Shipped", label: "Shipped" },
        { value: "Delivered", label: "Delivered" },
        { value: "Cancelled", label: "Cancelled" },
        { value: "Returned", label: "Returned" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select" as const,
      options: [
        { value: "Low", label: "Low" },
        { value: "Normal", label: "Normal" },
        { value: "High", label: "High" },
        { value: "Urgent", label: "Urgent" },
        { value: "Emergency", label: "Emergency" },
      ],
    },
    {
      key: "dateFrom",
      label: "Date From",
      type: "date" as const,
    },
    {
      key: "dateTo",
      label: "Date To",
      type: "date" as const,
    },
  ]

  const actions = (order: SalesOrder) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleView(order)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEdit(order)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {order.status === "Pending Approval" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700"
          onClick={() => handleApprove(order)}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}
      {order.status === "Approved" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => handleProcess(order)}
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700"
        onClick={() => handleDelete(order)}
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
            <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
            <p className="text-muted-foreground">Manage sales orders and customer relationships</p>
          </div>
          <SalesOrderForm onSuccess={fetchSalesOrders} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
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
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.shipped}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Orders Table */}
        <UnifiedDataTable
          data={salesOrders}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search sales orders..."
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
          onRefresh={fetchSalesOrders}
          onExport={() => console.log("Export sales orders")}
          emptyMessage="No sales orders found. Create your first sales order to get started."
        />
      </div>
    </DashboardLayout>
  )
}
