"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, Phone, Mail, MapPin, TrendingUp, Star } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Account {
  id: string
  name: string
  code: string
  type: "hospital" | "pharmacy" | "clinic" | "distributor" | "government" | "other"
  industry: string
  size: "small" | "medium" | "large" | "enterprise"
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  website?: string
  taxId?: string
  creditLimit: number
  paymentTerms: string
  status: "active" | "inactive" | "suspended" | "prospect"
  rating: number
  totalOrders: number
  totalRevenue: number
  lastOrderDate?: string
  assignedTo?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchAccounts()
  }, [searchQuery, pagination.page, typeFilter, statusFilter])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAccounts({
        search: searchQuery,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
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
    if (confirm(`Are you sure you want to delete account "${account.name}"?`)) {
      try {
        await apiService.deleteAccount(account.id)
        fetchAccounts()
      } catch (error) {
        console.error("Failed to delete account:", error)
      }
    }
  }

  const handleToggleStatus = async (account: Account) => {
    try {
      const newStatus = account.status === "active" ? "inactive" : "active"
      await apiService.updateAccount(account.id, { status: newStatus })
      fetchAccounts()
    } catch (error) {
      console.error("Failed to toggle account status:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "hospital":
        return "bg-blue-100 text-blue-800"
      case "pharmacy":
        return "bg-green-100 text-green-800"
      case "clinic":
        return "bg-purple-100 text-purple-800"
      case "distributor":
        return "bg-orange-100 text-orange-800"
      case "government":
        return "bg-red-100 text-red-800"
      case "other":
        return "bg-gray-100 text-gray-800"
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
      case "prospect":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSizeBadgeColor = (size: string) => {
    switch (size) {
      case "small":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "large":
        return "bg-orange-100 text-orange-800"
      case "enterprise":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ))
  }

  const calculateStats = () => {
    const activeAccounts = accounts.filter(a => a.status === "active").length
    const prospectAccounts = accounts.filter(a => a.status === "prospect").length
    const totalRevenue = accounts.reduce((sum, a) => sum + a.totalRevenue, 0)
    const avgRating = accounts.length > 0 
      ? (accounts.reduce((sum, a) => sum + a.rating, 0) / accounts.length).toFixed(1)
      : "0.0"

    return { activeAccounts, prospectAccounts, totalRevenue, avgRating }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Account",
      render: (account: Account) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{account.name}</div>
            <div className="text-sm text-muted-foreground">{account.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type & Size",
      render: (account: Account) => (
        <div className="space-y-1">
          <Badge className={getTypeBadgeColor(account.type)}>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
          </Badge>
          <Badge className={getSizeBadgeColor(account.size)}>
            {account.size.charAt(0).toUpperCase() + account.size.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (account: Account) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{account.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{account.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (account: Account) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{account.city}, {account.state}</span>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (account: Account) => (
        <div className="flex items-center gap-2">
          <div className="flex">{getRatingStars(account.rating)}</div>
          <span className="text-sm font-medium">{account.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: "performance",
      header: "Performance",
      render: (account: Account) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span>Revenue: ${account.totalRevenue.toFixed(2)}</span>
          </div>
          <div>Orders: {account.totalOrders}</div>
          {account.lastOrderDate && (
            <div className="text-muted-foreground">Last: {formatDateISO(account.lastOrderDate)}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (account: Account) => (
        <Badge className={getStatusBadgeColor(account.status)}>
          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
        </Badge>
      ),
    },
  ]

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
              <Plus className="mr-2 h-4 w-4" />
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
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prospects</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.prospectAccounts}</div>
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
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter accounts by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "hospital", label: "Hospital" },
                    { value: "pharmacy", label: "Pharmacy" },
                    { value: "clinic", label: "Clinic" },
                    { value: "distributor", label: "Distributor" },
                    { value: "government", label: "Government" },
                    { value: "other", label: "Other" },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={typeFilter === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "suspended", label: "Suspended" },
                    { value: "prospect", label: "Prospect" },
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
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Accounts</CardTitle>
            <CardDescription>A list of all customer accounts with their contact information and performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={accounts}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search accounts..."
              actions={(account: Account) => (
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
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
