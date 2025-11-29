"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Key, Shield, Users, Eye } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchRoles()
  }, [searchQuery, pagination.page])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRoles({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const roleData = response.data as {
          roles: Role[]
          pagination: { page: number; pages: number; total: number }
        }
        setRoles(roleData.roles || [])
        setPagination(roleData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error)
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

  const handleEdit = (role: Role) => {
    // Navigate to edit page
    window.location.href = `/dashboard/roles/${role.id}`
  }

  const handleDelete = async (role: Role) => {
    if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      try {
        await apiService.deleteRole(role.id)
        fetchRoles()
      } catch (error) {
        console.error("Failed to delete role:", error)
      }
    }
  }

  const handleToggleStatus = async (role: Role) => {
    try {
      await apiService.updateRole(role.id, { isActive: !role.isActive })
      fetchRoles()
    } catch (error) {
      console.error("Failed to toggle role status:", error)
    }
  }

  const calculateStats = () => {
    const activeRoles = roles.filter(role => role.isActive).length
    const inactiveRoles = roles.filter(role => !role.isActive).length
    const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0)

    return { activeRoles, inactiveRoles, totalUsers }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "Role",
      render: (role: Role) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{role.name}</div>
            <div className="text-sm text-muted-foreground">{role.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (role: Role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map((permission) => (
            <Badge key={permission} variant="secondary" className="text-xs">
              {permission}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{role.permissions.length - 3} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "userCount",
      header: "Users",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{role.userCount}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (role: Role) => (
        <Badge variant={role.isActive ? "default" : "secondary"}>
          {role.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created", render: (role: Role) => formatDateISO(role.createdAt) },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Roles Management</h1>
            <p className="text-muted-foreground">Manage system roles and their permissions</p>
          </div>

          <PermissionGuard module="IDENTITY" screen="roles" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/roles/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRoles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Roles</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactiveRoles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Roles</CardTitle>
            <CardDescription>A list of all system roles with their permissions and user assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={roles}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search roles..."
              actions={(role: Role) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="IDENTITY" screen="roles" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="IDENTITY" screen="roles" action="update">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleStatus(role)}
                    >
                      {role.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="IDENTITY" screen="roles" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(role)}>
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
