"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, User, Clock, Shield, AlertTriangle } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface RefreshToken {
  id: string
  userId: string
  userName: string
  userEmail: string
  token: string
  expiresAt: string
  isActive: boolean
  lastUsedAt: string
  createdAt: string
  ipAddress: string
  userAgent: string
}

export default function RefreshTokensPage() {
  const [tokens, setTokens] = useState<RefreshToken[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchTokens()
  }, [searchQuery, pagination.page, statusFilter])

  const fetchTokens = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRefreshTokens({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const tokenData = response.data as {
          tokens: RefreshToken[]
          pagination: { page: number; pages: number; total: number }
        }
        setTokens(tokenData.tokens || [])
        setPagination(tokenData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch refresh tokens:", error)
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

  const handleRevoke = async (token: RefreshToken) => {
    if (confirm(`Are you sure you want to revoke this refresh token for ${token.userName}?`)) {
      try {
        await apiService.revokeRefreshToken(token.id)
        fetchTokens()
      } catch (error) {
        console.error("Failed to revoke refresh token:", error)
      }
    }
  }

  const handleRevokeAll = async () => {
    if (confirm("Are you sure you want to revoke all refresh tokens? This will log out all users.")) {
      try {
        await apiService.revokeAllRefreshTokens()
        fetchTokens()
      } catch (error) {
        console.error("Failed to revoke all refresh tokens:", error)
      }
    }
  }

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const isTokenExpiringSoon = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const hoursUntilExpiry = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0
  }

  const getTokenStatus = (token: RefreshToken) => {
    if (!token.isActive) return "revoked"
    if (isTokenExpired(token.expiresAt)) return "expired"
    if (isTokenExpiringSoon(token.expiresAt)) return "expiring"
    return "active"
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expiring":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "revoked":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateStats = () => {
    const activeTokens = tokens.filter(t => getTokenStatus(t) === "active").length
    const expiredTokens = tokens.filter(t => getTokenStatus(t) === "expired").length
    const expiringTokens = tokens.filter(t => getTokenStatus(t) === "expiring").length
    const revokedTokens = tokens.filter(t => getTokenStatus(t) === "revoked").length

    return { activeTokens, expiredTokens, expiringTokens, revokedTokens }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "user",
      header: "User",
      render: (token: RefreshToken) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{token.userName}</div>
            <div className="text-sm text-muted-foreground">{token.userEmail}</div>
          </div>
        </div>
      ),
    },
    {
      key: "token",
      header: "Token",
      render: (token: RefreshToken) => (
        <div className="font-mono text-sm">
          {token.token.substring(0, 8)}...{token.token.substring(token.token.length - 8)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (token: RefreshToken) => {
        const status = getTokenStatus(token)
        return (
          <Badge className={getStatusBadgeColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      key: "expiresAt",
      header: "Expires",
      render: (token: RefreshToken) => {
        const isExpired = isTokenExpired(token.expiresAt)
        const isExpiring = isTokenExpiringSoon(token.expiresAt)
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={isExpired ? "text-red-600" : isExpiring ? "text-yellow-600" : ""}>
              {formatDateISO(token.expiresAt)}
            </span>
          </div>
        )
      },
    },
    {
      key: "lastUsedAt",
      header: "Last Used",
      render: (token: RefreshToken) => (
        <span className="text-sm text-muted-foreground">
          {token.lastUsedAt ? formatDateISO(token.lastUsedAt) : "Never"}
        </span>
      ),
    },
    {
      key: "ipAddress",
      header: "IP Address",
      render: (token: RefreshToken) => (
        <span className="font-mono text-sm">{token.ipAddress}</span>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refresh Tokens</h1>
            <p className="text-muted-foreground">Manage user refresh tokens and session security</p>
          </div>

          <PermissionGuard module="IDENTITY" screen="refresh_tokens" action="delete">
            <Button variant="destructive" onClick={handleRevokeAll}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Revoke All
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeTokens}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.expiringTokens}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired/Revoked</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expiredTokens + stats.revokedTokens}</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
            <CardDescription>Select a status to filter refresh tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Tokens" },
                { value: "active", label: "Active" },
                { value: "expiring", label: "Expiring Soon" },
                { value: "expired", label: "Expired" },
                { value: "revoked", label: "Revoked" },
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
          </CardContent>
        </Card>

        {/* Tokens Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Refresh Tokens</CardTitle>
            <CardDescription>A list of all refresh tokens with their status and security information.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tokens}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search tokens..."
              actions={(token: RefreshToken) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="IDENTITY" screen="refresh_tokens" action="delete">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRevoke(token)}
                      disabled={!token.isActive}
                    >
                      Revoke
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
