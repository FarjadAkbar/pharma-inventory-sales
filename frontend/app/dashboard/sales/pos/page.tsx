"use client"

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
  RotateCcw,
  Receipt
} from "lucide-react"
import Link from "next/link"
import { salesCrmApi } from "@/services/sales-crm-api.service"
import type { POSTransaction, POSFilters } from "@/types/sales"
import { formatDateISO, formatCurrency } from "@/lib/utils"

export default function POSPage() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<POSFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchTransactions()
  }, [searchQuery, filters, pagination.page])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await salesCrmApi.getPOSTransactions({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setTransactions(response.data.transactions || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
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

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case "voided":
        return <Badge className="bg-gray-100 text-gray-800"><RotateCcw className="h-3 w-3 mr-1" />Voided</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "refunded":
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns = [
    {
      key: "transactionNumber",
      header: "Receipt #",
      sortable: true,
      render: (tx: POSTransaction) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          {tx.transactionNumber}
        </div>
      ),
    },
    {
      key: "transactionDate",
      header: "Date",
      sortable: true,
      render: (tx: POSTransaction) => formatDateISO(tx.transactionDate),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      render: (tx: POSTransaction) => tx.customerName || "Walk-in",
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (tx: POSTransaction) => (
        <div className="font-bold text-blue-600">
          {formatCurrency(tx.total)}
        </div>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment",
      sortable: true,
      render: (tx: POSTransaction) => (
        <span className="capitalize">{tx.paymentMethod}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (tx: POSTransaction) => getStatusBadge(tx.status),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      sortable: true,
      render: (tx: POSTransaction) => getPaymentStatusBadge(tx.paymentStatus),
    },
  ]

  const filterOptions = [
    {
      key: "status",
      label: "Transaction Status",
      type: "select" as const,
      options: [
        { value: "completed", label: "Completed" },
        { value: "draft", label: "Draft" },
        { value: "cancelled", label: "Cancelled" },
        { value: "voided", label: "Voided" },
      ],
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      type: "select" as const,
      options: [
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Paid" },
        { value: "failed", label: "Failed" },
        { value: "refunded", label: "Refunded" },
      ],
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      type: "select" as const,
      options: [
        { value: "cash", label: "Cash" },
        { value: "card", label: "Card" },
        { value: "mobile", label: "Mobile" },
        { value: "check", label: "Check" },
        { value: "other", label: "Other" },
      ],
    },
  ]

  const actions = (tx: POSTransaction) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/sales/pos/${tx.id}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(tx.receiptUrl, '_blank')}
        disabled={!tx.receiptUrl}
      >
        <Receipt className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">POS (Point of Sale)</h1>
            <p className="text-muted-foreground">Manage retail transactions and sales receipts</p>
          </div>
          <Link href="/dashboard/sales/pos/new">
            <Button>
              <Plus />
              New Transaction
            </Button>
          </Link>
        </div>

        {/* POS Table */}
        <UnifiedDataTable
          data={transactions}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search transactions..."
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
          onRefresh={fetchTransactions}
          emptyMessage="No POS transactions found. Start a new sale to see it here."
        />
      </div>
    </DashboardLayout>
  )
}
