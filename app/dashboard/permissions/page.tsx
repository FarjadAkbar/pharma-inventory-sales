"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Shield, Key, Eye, Settings } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Permission {
  id: string
  name: string
  description: string
  module: string
  action: string
  resource: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [selectedModule, setSelectedModule] = useState("all")

  useEffect(() => {
    fetchPermissions()
  }, [searchQuery, pagination.page, selectedModule])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPermissions({
        search: searchQuery,
        module: selectedModule !== "all" ? selectedModule : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const permissionData = response.data as {
          permissions: Permission[]
          pagination: { page: number; pages: number; total: number }
        }
        setPermissions(permissionData.permissions || [])
        setPagination(permissionData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error)
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

  const handleEdit = (permission: Permission) => {
    // Navigate to edit page
    window.location.href = `/dashboard/permissions/${permission.id}`
  }

  const handleDelete = async (permission: Permission) => {
    if (confirm(`Are you sure you want to delete permission "${permission.name}"?`)) {
      try {
        await apiService.deletePermission(permission.id)
        fetchPermissions()
      } catch (error) {
        console.error("Failed to delete permission:", error)
      }
    }
  }

  const handleToggleStatus = async (permission: Permission) => {
    try {
      await apiService.updatePermission(permission.id, { isActive: !permission.isActive })
      fetchPermissions()
    } catch (error) {
      console.error("Failed to toggle permission status:", error)
    }
  }

  const getModuleBadgeColor = (module: string) => {
    const colors: Record<string, string> = {
      identity: "bg-blue-100 text-blue-800",
      master: "bg-green-100 text-green-800",
      procurement: "bg-purple-100 text-purple-800",
      manufacturing: "bg-orange-100 text-orange-800",
      quality: "bg-yellow-100 text-yellow-800",
      warehouse: "bg-teal-100 text-teal-800",
      distribution: "bg-pink-100 text-pink-800",
      sales: "bg-indigo-100 text-indigo-800",
      regulatory: "bg-red-100 text-red-800",
      reporting: "bg-gray-100 text-gray-800",
    }
    return colors[module.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      view: "bg-blue-100 text-blue-800",
      create: "bg-green-100 text-green-800",
      edit: "bg-yellow-100 text-yellow-800",
      delete: "bg-red-100 text-red-800",
      approve: "bg-purple-100 text-purple-800",
      reject: "bg-orange-100 text-orange-800",
    }
    return colors[action.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  const calculateStats = () => {
    const activePermissions = permissions.filter(p => p.isActive).length
    const inactivePermissions = permissions.filter(p => !p.isActive).length
    const modules = [...new Set(permissions.map(p => p.module))].length

    return { activePermissions, inactivePermissions, modules }
  }

  const stats = calculateStats()

  const modules = [
    { value: "all", label: "All Modules" },
    { value: "identity", label: "Identity & Authentication" },
    { value: "master", label: "Master Data" },
    { value: "procurement", label: "Procurement" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "quality", label: "Quality Control/Assurance" },
    { value: "warehouse", label: "Warehouse" },
    { value: "distribution", label: "Distribution" },
    { value: "sales", label: "Sales/CRM" },
    { value: "regulatory", label: "Regulatory" },
    { value: "reporting", label: "Reporting" },
  ]

  const columns = [
    {
      key: "name",
      header: "Permission",
      render: (permission: Permission) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{permission.name}</div>
            <div className="text-sm text-muted-foreground">{permission.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: "module",
      header: "Module",
      render: (permission: Permission) => (
        <Badge className={getModuleBadgeColor(permission.module)}>
          {permission.module.charAt(0).toUpperCase() + permission.module.slice(1)}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (permission: Permission) => (
        <Badge className={getActionBadgeColor(permission.action)}>
          {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)}
        </Badge>
      ),
    },
    {
      key: "resource",
      header: "Resource",
      render: (permission: Permission) => (
        <span className="text-sm font-mono">{permission.resource}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (permission: Permission) => (
        <Badge variant={permission.isActive ? "default" : "secondary"}>
          {permission.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created", render: (permission: Permission) => formatDateISO(permission.createdAt) },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>
            <p className="text-muted-foreground">Manage system permissions and access controls</p>
          </div>

          <PermissionGuard module="IDENTITY" screen="permissions" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/permissions/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Permissions</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePermissions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Permissions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactivePermissions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.modules}</div>
            </CardContent>
          </Card>
        </div>

        {/* Module Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Module</CardTitle>
            <CardDescription>Select a module to filter permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {modules.map((module) => (
                <Button
                  key={module.value}
                  variant={selectedModule === module.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedModule(module.value)}
                >
                  {module.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Permissions</CardTitle>
            <CardDescription>A list of all system permissions organized by module and action.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={permissions}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search permissions..."
              actions={(permission: Permission) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="IDENTITY" screen="permissions" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(permission)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="IDENTITY" screen="permissions" action="update">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleStatus(permission)}
                    >
                      {permission.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="IDENTITY" screen="permissions" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(permission)}>
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
