"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, ShoppingCart, Users, Eye } from "lucide-react"
import { mockSales } from "@/lib/mock-data"
import { formatDateISO } from "@/lib/utils"
import type { Sale } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePermissions } from "@/hooks/use-permissions"
import { AccessDenied } from "@/components/ui/access-denied"

export default function SalesPage() {
  const [sales] = useState<Sale[]>(mockSales)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const { can } = usePermissions()

  if (!can("view_sales")) {
    return <AccessDenied title="Sales Access Denied" description="You don't have permission to view sales data." />
  }

  const getStatusColor = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateStats = () => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const completedSales = sales.filter((sale) => sale.status === "completed").length
    const pendingSales = sales.filter((sale) => sale.status === "pending").length
    const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0

    return {
      totalRevenue,
      totalSales: sales.length,
      completedSales,
      pendingSales,
      averageOrderValue,
    }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (sale: Sale) => `#${sale.id}`,
    },
    {
      key: "customerName",
      header: "Customer",
      render: (sale: Sale) => (
        <div>
          <div className="font-medium">{sale.customerName}</div>
          <div className="text-sm text-muted-foreground">{sale.customerEmail}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (sale: Sale) => (
        <div className="text-sm">
          {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (sale: Sale) => `$${sale.total.toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (sale: Sale) => (
        <Badge className={getStatusColor(sale.status)}>
          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (sale: Sale) => formatDateISO(sale.createdAt),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Track and analyze your sales performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {stats.totalSales} orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSales}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingSales} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(sales.map((s) => s.customerId)).size}</div>
              <p className="text-xs text-muted-foreground">Total customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>View and manage all sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={sales}
              columns={columns}
              actions={(sale: Sale) => (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Sale Details - #{sale.id}</DialogTitle>
                      <DialogDescription>Complete information about this sale</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Customer Info */}
                      <div>
                        <h3 className="font-medium mb-2">Customer Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <div className="font-medium">{sale.customerName}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <div className="font-medium">{sale.customerEmail || "N/A"}</div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h3 className="font-medium mb-2">Items Purchased</h3>
                        <div className="space-y-2">
                          {sale.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                              <div>
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-sm text-muted-foreground">
                                  ${item.price.toFixed(2)} × {item.quantity}
                                </div>
                              </div>
                              <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h3 className="font-medium mb-2">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className={getStatusColor(sale.status)}>
                              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Order Date:</span>
                            <span>{formatDateISO(sale.createdAt)}</span>
                          </div>
                          <div className="flex justify-between font-medium text-base">
                            <span>Total:</span>
                            <span>${sale.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
