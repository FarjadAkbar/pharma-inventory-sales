"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter,
  Eye,
  Download,
  RefreshCw,
  User,
  Calendar,
  Activity,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { AuditTrail, AuditFilters } from "@/types/reporting"
import { formatDateISO } from "@/lib/utils"

export default function AuditTrailPage() {
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<AuditFilters>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchAuditTrails()
  }, [searchQuery, filters, pagination.page])

  const fetchAuditTrails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAuditTrails({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setAuditTrails(response.data.auditTrails || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch audit trails:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "UPDATE":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "DELETE":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "RESTORE":
        return <RefreshCw className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-green-100 text-green-800">Created</Badge>
      case "UPDATE":
        return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>
      case "DELETE":
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>
      case "RESTORE":
        return <Badge className="bg-orange-100 text-orange-800">Restored</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "SalesOrder":
        return <Database className="h-4 w-4" />
      case "Shipment":
        return <Activity className="h-4 w-4" />
      case "User":
        return <User className="h-4 w-4" />
      case "Drug":
        return <Database className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case "Created":
        return <Badge className="bg-green-100 text-green-800">Created</Badge>
      case "Updated":
        return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>
      case "Deleted":
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>
      case "Restored":
        return <Badge className="bg-orange-100 text-orange-800">Restored</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const calculateStats = () => {
    const total = auditTrails.length
    const creates = auditTrails.filter(trail => trail.action === "CREATE").length
    const updates = auditTrails.filter(trail => trail.action === "UPDATE").length
    const deletes = auditTrails.filter(trail => trail.action === "DELETE").length
    const restores = auditTrails.filter(trail => trail.action === "RESTORE").length

    return { total, creates, updates, deletes, restores }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (trail: AuditTrail) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateISO(trail.timestamp)}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (trail: AuditTrail) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {trail.userName}
          </div>
          <div className="text-xs text-muted-foreground">{trail.userRole}</div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (trail: AuditTrail) => (
        <div className="flex items-center gap-2">
          {getActionIcon(trail.action)}
          {getActionBadge(trail.action)}
        </div>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      render: (trail: AuditTrail) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            {getEntityIcon(trail.entityType)}
            <span className="font-medium">{trail.entityType}</span>
          </div>
          <div className="text-xs text-muted-foreground">{trail.entityName}</div>
        </div>
      ),
    },
    {
      key: "changes",
      header: "Changes",
      render: (trail: AuditTrail) => (
        <div className="text-sm">
          <div className="font-medium">{trail.changes.length} changes</div>
          <div className="text-xs text-muted-foreground">
            {trail.changes.map(change => change.field).join(", ")}
          </div>
        </div>
      ),
    },
    {
      key: "ipAddress",
      header: "IP Address",
      render: (trail: AuditTrail) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {trail.ipAddress}
          </div>
        </div>
      ),
    },
    {
      key: "sessionId",
      header: "Session",
      render: (trail: AuditTrail) => (
        <div className="text-sm font-mono text-xs">
          {trail.sessionId.substring(0, 8)}...
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Trail Explorer</h1>
            <p className="text-muted-foreground">User activity and data modifications tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchAuditTrails}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.creates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Updated</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.updates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deleted</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.deletes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restored</CardTitle>
              <RefreshCw className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.restores}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit trails..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">User</label>
                <Select value={filters.userId || ""} onValueChange={(value) => handleFilterChange("userId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">System Admin</SelectItem>
                    <SelectItem value="2">Ms. Ayesha Khan</SelectItem>
                    <SelectItem value="3">Dr. Ahmed Hassan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={filters.action || ""} onValueChange={(value) => handleFilterChange("action", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="RESTORE">Restore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Entity Type</label>
                <Select value={filters.entityType || ""} onValueChange={(value) => handleFilterChange("entityType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SalesOrder">Sales Order</SelectItem>
                    <SelectItem value="Shipment">Shipment</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Drug">Drug</SelectItem>
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
            </div>
          </CardContent>
        </Card>

        {/* Audit Trails Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Complete audit trail of all user activities and data modifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={auditTrails}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search audit trails..."
              actions={(trail: AuditTrail) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Change Details Modal Placeholder */}
        {auditTrails.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recent Changes
              </CardTitle>
              <CardDescription>Detailed view of recent data modifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditTrails.slice(0, 3).map((trail) => (
                  <div key={trail.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getActionIcon(trail.action)}
                        <span className="font-medium">{trail.userName}</span>
                        <span className="text-sm text-muted-foreground">{trail.action}</span>
                        <span className="text-sm font-medium">{trail.entityType}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateISO(trail.timestamp)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {trail.entityName} • {trail.ipAddress}
                    </div>
                    <div className="space-y-2">
                      {trail.changes.map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{change.field}:</span>
                          <span className="text-muted-foreground">
                            {change.oldValue ? `${change.oldValue} → ` : ""}
                            {change.newValue}
                          </span>
                          {getChangeTypeBadge(change.changeType)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
