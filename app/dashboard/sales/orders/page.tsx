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
  User,
  Calendar,
  Package,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  DollarSign,
  MapPin,
  Phone,
  Mail
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

  const handleFilterChange = (key: keyof SalesOrderFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
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
      const response = await apiService.updateSalesOrder(order.id, {
        ...order,
        status: "Approved"
      })
      
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
      render: (order: SalesOrder) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {order.orderNumber}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
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
      render: (order: SalesOrder) => getPriorityBadge(order.priority),
    },
    {
      key: "status",
      header: "Status",
      render: (order: SalesOrder) => getStatusBadge(order.status),
    },
    {
      key: "dates",
      header: "Dates",
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Customer</label>
                <Select value={filters.accountId || ""} onValueChange={(value) => handleFilterChange("accountId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ziauddin Hospital - Clifton</SelectItem>
                    <SelectItem value="2">Aga Khan University Hospital</SelectItem>
                    <SelectItem value="3">Liaquat National Hospital</SelectItem>
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
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Allocated">Allocated</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={filters.priority || ""} onValueChange={(value) => handleFilterChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Orders</CardTitle>
            <CardDescription>A comprehensive view of all sales orders and customer relationships.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={salesOrders}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search sales orders..."
              actions={(order: SalesOrder) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {order.status === "Pending Approval" && (
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleApprove(order)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {order.status === "Approved" && (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => handleProcess(order)}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(order)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
