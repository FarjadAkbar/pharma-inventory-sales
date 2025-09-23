"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  Truck,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SalesOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  status: 'draft' | 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  totalAmount: number
  currency: string
  orderDate: string
  expectedDelivery: string
  items: SalesOrderItem[]
  assignedTo?: string
  notes?: string
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue'
  shippingAddress: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
}

interface SalesOrderItem {
  id: string
  productName: string
  productCode: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'available' | 'backorder' | 'discontinued'
}

interface EnhancedSalesOrderCardsProps {
  orders: SalesOrder[]
  onView?: (order: SalesOrder) => void
  onEdit?: (order: SalesOrder) => void
  onDelete?: (order: SalesOrder) => void
  onStatusChange?: (order: SalesOrder, status: string) => void
  className?: string
}

export function EnhancedSalesOrderCards({
  orders,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  className
}: EnhancedSalesOrderCardsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'customer'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'partial':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'processing':
        return <Package className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.orderDate).getTime()
          bValue = new Date(b.orderDate).getTime()
          break
        case 'amount':
          aValue = a.totalAmount
          bValue = b.totalAmount
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'customer':
          aValue = a.customerName
          bValue = b.customerName
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedOrders.map((order) => (
        <Card key={order.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">{order.orderNumber}</CardTitle>
                <CardDescription className="text-sm">{order.customerName}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(order)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(order)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Order
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(order)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Order
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Status and Priority */}
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </Badge>
              <Badge className={getPriorityColor(order.priority)}>
                {order.priority}
              </Badge>
            </div>

            {/* Amount and Payment Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold">
                  {order.currency} {order.totalAmount.toLocaleString()}
                </span>
              </div>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>

            {/* Items Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total Quantity: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {order.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-muted-foreground">{order.customerEmail}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {onView && (
                <Button variant="outline" size="sm" onClick={() => onView(order)} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(order)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-4">
      {filteredAndSortedOrders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {order.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{order.orderNumber}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-semibold">
                    {order.currency} {order.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </div>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  {onView && (
                    <Button variant="outline" size="sm" onClick={() => onView(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(order)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(order)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Order
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md text-sm"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Sort
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('desc') }}>
                Order Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('amount'); setSortOrder('desc') }}>
                Amount
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('status'); setSortOrder('asc') }}>
                Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('customer'); setSortOrder('asc') }}>
                Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedOrders.length} of {orders.length} orders
      </div>

      {/* Cards/List */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}
    </div>
  )
}
