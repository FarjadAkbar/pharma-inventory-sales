"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, Phone, Mail, MapPin, TrendingUp } from "lucide-react"
import { salesCrmApi } from "@/services/sales-crm-api.service"
import { toast } from "sonner"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Account {
  id: number
  accountNumber: string
  accountName: string
  accountCode: string
  type: "customer" | "distributor" | "partner" | "vendor"
  status: "active" | "inactive" | "suspended" | "closed"
  phone?: string
  email?: string
  billingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    contactPerson?: string
    phone?: string
    email?: string
  }
  shippingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    contactPerson?: string
    phone?: string
    email?: string
  }
  creditLimit?: number
  paymentTerms?: string
  assignedSalesRep?: number
  assignedSalesRepName?: string
  taxId?: string
  registrationNumber?: string
  notes?: string
  tags?: string[]
  createdBy: number
  createdAt: string
  updatedAt: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchAccounts()
  }, [searchQuery, pagination.page, filters])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await salesCrmApi.getAccounts({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const accountData = response.data as {
          accounts: Account[]
          pagination: { page: number; pages: number; total: number }
        }
        setAccounts(accountData.accounts || [])
        setPagination(accountData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error)
      toast.error("Failed to fetch accounts")
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

  const handleEdit = (account: Account) => {
    window.location.href = `/dashboard/sales/accounts/${account.id}`
  }

  const handleDelete = async (account: Account) => {
    if (confirm(`Are you sure you want to delete account "${account.accountName}"?`)) {
      try {
        await salesCrmApi.deleteAccount(account.id.toString())
        toast.success("Account deleted successfully")
        fetchAccounts()
      } catch (error) {
        console.error("Failed to delete account:", error)
        toast.error("Failed to delete account")
      }
    }
  }

  const handleToggleStatus = async (account: Account) => {
    try {
      const newStatus = account.status === "active" ? "inactive" : "active"
      await salesCrmApi.updateAccount(account.id.toString(), { status: newStatus })
      toast.success("Account status updated")
      fetchAccounts()
    } catch (error) {
      console.error("Failed to toggle account status:", error)
      toast.error("Failed to update account status")
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "customer":
        return "bg-blue-100 text-blue-800"
      case "distributor":
        return "bg-orange-100 text-orange-800"
      case "partner":
        return "bg-purple-100 text-purple-800"
      case "vendor":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateStats = () => {
    const activeAccounts = accounts.filter(a => a.status === "active").length
    const inactiveAccounts = accounts.filter(a => a.status === "inactive").length
    const suspendedAccounts = accounts.filter(a => a.status === "suspended").length
    const totalAccounts = pagination.total

    return { activeAccounts, inactiveAccounts, suspendedAccounts, totalAccounts }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Account",
      sortable: true,
      render: (account: Account) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{account.accountName}</div>
            <div className="text-sm text-muted-foreground">{account.accountCode} | {account.accountNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (account: Account) => (
        <Badge className={getTypeBadgeColor(account.type)}>
          {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      sortable: true,
      render: (account: Account) => (
        <div className="space-y-1 text-sm">
          {account.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{account.email}</span>
            </div>
          )}
          {account.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{account.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (account: Account) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>
            {account.billingAddress?.city || account.shippingAddress?.city || "N/A"}, {account.billingAddress?.state || account.shippingAddress?.state || ""}
          </span>
        </div>
      ),
    },
    {
      key: "creditLimit",
      header: "Credit Limit",
      sortable: true,
      render: (account: Account) => (
        <div className="text-sm">
          {account.creditLimit ? `$${account.creditLimit.toLocaleString()}` : "N/A"}
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Sales Rep",
      sortable: true,
      render: (account: Account) => (
        <div className="text-sm">
          {account.assignedSalesRepName || "Unassigned"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (account: Account) => (
        <Badge className={getStatusBadgeColor(account.status)}>
          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
        </Badge>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "type",
      label: "Type",
      type: "select" as const,
      options: [
        { value: "customer", label: "Customer" },
        { value: "distributor", label: "Distributor" },
        { value: "partner", label: "Partner" },
        { value: "vendor", label: "Vendor" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "suspended", label: "Suspended" },
        { value: "closed", label: "Closed" },
      ],
    },
  ]

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const actions = (account: Account) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="SALES" screen="accounts" action="update">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
          Edit
        </Button>
      </PermissionGuard>
      <PermissionGuard module="SALES" screen="accounts" action="update">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleToggleStatus(account)}
        >
          {account.status === "active" ? "Deactivate" : "Activate"}
        </Button>
      </PermissionGuard>
      <PermissionGuard module="SALES" screen="accounts" action="delete">
        <Button variant="ghost" size="sm" onClick={() => handleDelete(account)}>
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
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground">Manage customer accounts and relationships</p>
          </div>

          <PermissionGuard module="SALES" screen="accounts" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/sales/accounts/new")}>
              <Plus />
              Add Account
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Building2 className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactiveAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <Building2 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.suspendedAccounts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Table */}
        <UnifiedDataTable
          data={accounts}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search accounts..."
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
          onRefresh={fetchAccounts}
          onExport={() => console.log("Export accounts")}
          emptyMessage="No accounts found. Add your first account to get started."
        />
      </div>
    </DashboardLayout>
  )
}
