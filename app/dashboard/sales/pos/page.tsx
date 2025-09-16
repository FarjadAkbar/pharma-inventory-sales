"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CreditCard, ShoppingCart, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface POSTransaction {
  id: string
  transactionNumber: string
  terminalId: string
  terminalName: string
  siteId: string
  siteName: string
  cashierId: string
  cashierName: string
  customerId?: string
  customerName?: string
  items: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "card" | "mobile" | "check" | "other"
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
  status: "draft" | "completed" | "cancelled" | "voided"
  transactionDate: string
  createdAt: string
  updatedAt: string
}

export default function POSPage() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")

  useEffect(() => {
    fetchTransactions()
  }, [searchQuery, pagination.page, statusFilter, paymentMethodFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPOSTransactions({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const transactionData = response.data as {
          transactions: POSTransaction[]
          pagination: { page: number; pages: number; total: number }
        }
        setTransactions(transactionData.transactions || [])
        setPagination(transactionData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch POS transactions:", error)
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

  const handleEdit = (transaction: POSTransaction) => {
    window.location.href = `/dashboard/sales/pos/${transaction.id}`
  }

  const handleDelete = async (transaction: POSTransaction) => {
    if (confirm(`Are you sure you want to delete transaction "${transaction.transactionNumber}"?`)) {
      try {
        await apiService.deletePOSTransaction(transaction.id)
        fetchTransactions()
      } catch (error) {
        console.error("Failed to delete POS transaction:", error)
      }
    }
  }

  const handleVoid = async (transaction: POSTransaction) => {
    if (confirm(`Are you sure you want to void transaction "${transaction.transactionNumber}"?`)) {
      try {
        await apiService.voidPOSTransaction(transaction.id)
        fetchTransactions()
      } catch (error) {
        console.error("Failed to void POS transaction:", error)
      }
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "voided":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodBadgeColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800"
      case "card":
        return "bg-blue-100 text-blue-800"
      case "mobile":
        return "bg-purple-100 text-purple-800"
      case "check":
        return "bg-orange-100 text-orange-800"
      case "other":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateStats = () => {
    const totalTransactions = transactions.length
    const completedTransactions = transactions.filter(t => t.status === "completed").length
    const totalRevenue = transactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.total, 0)
    const avgTransactionValue = completedTransactions > 0 
      ? (totalRevenue / completedTransactions).toFixed(2)
      : "0.00"

    return { totalTransactions, completedTransactions, totalRevenue, avgTransactionValue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "transaction",
      header: "Transaction",
      render: (transaction: POSTransaction) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{transaction.transactionNumber}</div>
            <div className="text-sm text-muted-foreground">{transaction.terminalName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "cashier",
      header: "Cashier",
      render: (transaction: POSTransaction) => (
        <div className="text-sm">
          <div className="font-medium">{transaction.cashierName}</div>
          <div className="text-muted-foreground">{transaction.siteName}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (transaction: POSTransaction) => (
        <div className="text-sm">
          {transaction.customerName ? (
            <div className="font-medium">{transaction.customerName}</div>
          ) : (
            <span className="text-muted-foreground">Walk-in customer</span>
          )}
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (transaction: POSTransaction) => (
        <div className="space-y-1 text-sm">
          <div className="font-medium">{transaction.items.length} items</div>
          {transaction.items.slice(0, 2).map((item, index) => (
            <div key={index} className="text-muted-foreground">
              {item.quantity}x {item.productName}
            </div>
          ))}
          {transaction.items.length > 2 && (
            <div className="text-muted-foreground">+{transaction.items.length - 2} more</div>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (transaction: POSTransaction) => (
        <div className="space-y-1 text-sm">
          <div className="font-medium">${transaction.total.toFixed(2)}</div>
          <div className="text-muted-foreground">
            Subtotal: ${transaction.subtotal.toFixed(2)}
          </div>
          {transaction.discount > 0 && (
            <div className="text-green-600">
              Discount: ${transaction.discount.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (transaction: POSTransaction) => (
        <div className="space-y-1">
          <Badge className={getPaymentMethodBadgeColor(transaction.paymentMethod)}>
            {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
          </Badge>
          <Badge className={getPaymentStatusBadgeColor(transaction.paymentStatus)}>
            {transaction.paymentStatus.charAt(0).toUpperCase() + transaction.paymentStatus.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (transaction: POSTransaction) => (
        <Badge className={getStatusBadgeColor(transaction.status)}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "transactionDate",
      header: "Date",
      render: (transaction: POSTransaction) => (
        <div className="text-sm">
          <div>{formatDateISO(transaction.transactionDate)}</div>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-muted-foreground">Manage POS transactions and sales</p>
          </div>

          <PermissionGuard module="SALES" screen="pos" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/sales/pos/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${stats.avgTransactionValue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter transactions by status and payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Status" },
                    { value: "draft", label: "Draft" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                    { value: "voided", label: "Voided" },
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={statusFilter === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status.value)}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Methods" },
                    { value: "cash", label: "Cash" },
                    { value: "card", label: "Card" },
                    { value: "mobile", label: "Mobile" },
                    { value: "check", label: "Check" },
                    { value: "other", label: "Other" },
                  ].map((method) => (
                    <Button
                      key={method.value}
                      variant={paymentMethodFilter === method.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethodFilter(method.value)}
                    >
                      {method.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All POS Transactions</CardTitle>
            <CardDescription>A list of all point of sale transactions with payment details.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={transactions}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search transactions..."
              actions={(transaction: POSTransaction) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="SALES" screen="pos" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  {transaction.status === "completed" && (
                    <PermissionGuard module="SALES" screen="pos" action="void">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleVoid(transaction)}
                        className="text-red-600"
                      >
                        Void
                      </Button>
                    </PermissionGuard>
                  )}
                  <PermissionGuard module="SALES" screen="pos" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction)}>
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
