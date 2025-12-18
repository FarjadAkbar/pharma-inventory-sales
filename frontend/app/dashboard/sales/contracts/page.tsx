"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Calendar, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Contract {
  id: string
  contractNumber: string
  title: string
  accountId: string
  accountName: string
  type: "sales" | "service" | "maintenance" | "supply" | "distribution"
  status: "draft" | "pending" | "active" | "expired" | "terminated" | "renewed"
  startDate: string
  endDate: string
  renewalDate?: string
  value: number
  currency: string
  paymentTerms: string
  contractManager: string
  contractManagerName: string
  signedBy?: string
  signedByName?: string
  signedDate?: string
  autoRenewal: boolean
  terms: string
  specialConditions?: string
  createdAt: string
  updatedAt: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchContracts()
  }, [searchQuery, pagination.page, typeFilter, statusFilter])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getContracts({
        search: searchQuery,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const contractData = response.data as {
          contracts: Contract[]
          pagination: { page: number; pages: number; total: number }
        }
        setContracts(contractData.contracts || [])
        setPagination(contractData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch contracts:", error)
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

  const handleEdit = (contract: Contract) => {
    window.location.href = `/dashboard/sales/contracts/${contract.id}`
  }

  const handleDelete = async (contract: Contract) => {
    if (confirm(`Are you sure you want to delete contract "${contract.contractNumber}"?`)) {
      try {
        await apiService.deleteContract(contract.id)
        fetchContracts()
      } catch (error) {
        console.error("Failed to delete contract:", error)
      }
    }
  }

  const handleRenew = async (contract: Contract) => {
    try {
      await apiService.renewContract(contract.id)
      fetchContracts()
    } catch (error) {
      console.error("Failed to renew contract:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "sales":
        return "bg-blue-100 text-blue-800"
      case "service":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-purple-100 text-purple-800"
      case "supply":
        return "bg-orange-100 text-orange-800"
      case "distribution":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "terminated":
        return "bg-red-100 text-red-800"
      case "renewed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isContractExpiringSoon = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const daysUntilExpiry = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isContractExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const calculateStats = () => {
    const totalContracts = contracts.length
    const activeContracts = contracts.filter(c => c.status === "active").length
    const expiringContracts = contracts.filter(c => isContractExpiringSoon(c.endDate)).length
    const totalValue = contracts.reduce((sum, c) => sum + c.value, 0)

    return { totalContracts, activeContracts, expiringContracts, totalValue }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "contract",
      header: "Contract",
      render: (contract: Contract) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{contract.contractNumber}</div>
            <div className="text-sm text-muted-foreground">{contract.title}</div>
          </div>
        </div>
      ),
    },
    {
      key: "account",
      header: "Account",
      render: (contract: Contract) => (
        <div className="text-sm">
          <div className="font-medium">{contract.accountName}</div>
          <div className="text-muted-foreground">Manager: {contract.contractManagerName}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (contract: Contract) => (
        <Badge className={getTypeBadgeColor(contract.type)}>
          {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (contract: Contract) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{contract.value.toLocaleString()} {contract.currency}</span>
          </div>
          <div className="text-muted-foreground">{contract.paymentTerms}</div>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (contract: Contract) => {
        const isExpired = isContractExpired(contract.endDate)
        const isExpiringSoon = isContractExpiringSoon(contract.endDate)
        
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>Start: {formatDateISO(contract.startDate)}</span>
            </div>
            <div className={`flex items-center gap-2 ${
              isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : "text-green-600"
            }`}>
              <span>End: {formatDateISO(contract.endDate)}</span>
              {isExpired && <AlertTriangle className="h-3 w-3" />}
              {isExpiringSoon && !isExpired && <AlertTriangle className="h-3 w-3" />}
            </div>
            {contract.autoRenewal && (
              <div className="text-xs text-blue-600">Auto-renewal enabled</div>
            )}
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (contract: Contract) => (
        <Badge className={getStatusBadgeColor(contract.status)}>
          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "signature",
      header: "Signature",
      render: (contract: Contract) => (
        <div className="text-sm">
          {contract.signedByName ? (
            <div>
              <div className="font-medium">{contract.signedByName}</div>
              <div className="text-muted-foreground">{contract.signedDate ? formatDateISO(contract.signedDate) : "Not signed"}</div>
            </div>
          ) : (
            <span className="text-muted-foreground">Not signed</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
            <p className="text-muted-foreground">Manage sales contracts and agreements</p>
          </div>

          <PermissionGuard module="SALES" screen="contracts" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/sales/contracts/new")}>
              <Plus />
              Add Contract
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeContracts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.expiringContracts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${stats.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter contracts by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "sales", label: "Sales" },
                    { value: "service", label: "Service" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "supply", label: "Supply" },
                    { value: "distribution", label: "Distribution" },
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
                    { value: "draft", label: "Draft" },
                    { value: "pending", label: "Pending" },
                    { value: "active", label: "Active" },
                    { value: "expired", label: "Expired" },
                    { value: "terminated", label: "Terminated" },
                    { value: "renewed", label: "Renewed" },
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

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Contracts</CardTitle>
            <CardDescription>A list of all contracts with their terms and status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={contracts}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search contracts..."
              actions={(contract: Contract) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="SALES" screen="contracts" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  {contract.status === "active" && isContractExpiringSoon(contract.endDate) && (
                    <PermissionGuard module="SALES" screen="contracts" action="renew">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRenew(contract)}
                        className="text-blue-600"
                      >
                        Renew
                      </Button>
                    </PermissionGuard>
                  )}
                  <PermissionGuard module="SALES" screen="contracts" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(contract)}>
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
