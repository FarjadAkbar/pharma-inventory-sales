"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Shield, Key, Eye, Settings } from "lucide-react"
import { permissionsApi } from "@/services"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PermissionForm } from "@/components/permissions/permission-form"

interface Permission {
  id: number
  name: string
  description?: string
  resource?: string
  action?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)

  useEffect(() => {
    fetchPermissions()
  }, [searchQuery, pagination.page])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await permissionsApi.getPermissions({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })

      // Backend returns array directly or wrapped in docs
      const permissionsData = Array.isArray(response) ? response : (response?.docs || response?.data || [])
      setPermissions(permissionsData)
      
      // Handle pagination if available
      if (response?.pagination) {
        setPagination(response.pagination)
      } else if (response?.total !== undefined) {
        setPagination({
          page: response?.page || pagination.page,
          pages: Math.ceil((response?.total || 0) / (response?.limit || 10)),
          total: response?.total || 0
        })
      } else {
        setPagination({ page: 1, pages: 1, total: permissionsData.length })
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
    setEditingPermission(permission)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingPermission(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPermission(null)
  }

  const handleSubmit = async (data: {
    name: string
    description?: string
    resource?: string
    action?: string
  }) => {
    try {
      if (editingPermission) {
        await permissionsApi.updatePermission(editingPermission.id.toString(), data)
      } else {
        await permissionsApi.createPermission(data)
      }
      handleCloseModal()
      fetchPermissions()
    } catch (error) {
      console.error("Failed to save permission:", error)
      throw error
    }
  }

  const handleDelete = async (permission: Permission) => {
    if (confirm(`Are you sure you want to delete permission "${permission.name}"?`)) {
      try {
        await permissionsApi.deletePermission(permission.id.toString())
        fetchPermissions()
      } catch (error) {
        console.error("Failed to delete permission:", error)
      }
    }
  }

  const handleToggleStatus = async (permission: Permission) => {
    // Backend doesn't support isActive toggle, so we'll just refresh
    fetchPermissions()
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
    // Backend doesn't have isActive field, so we'll show all as active
    const activePermissions = permissions.length
    const inactivePermissions = 0
    // Extract module from resource if available, otherwise use resource as module
    const modules = [...new Set(permissions.map(p => p.resource || 'other'))].length

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
      key: "resource",
      header: "Resource",
      render: (permission: Permission) => (
        <Badge className={getModuleBadgeColor(permission.resource || 'other')}>
          {permission.resource ? permission.resource.charAt(0).toUpperCase() + permission.resource.slice(1) : 'Other'}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (permission: Permission) => (
        <Badge className={getActionBadgeColor(permission.action || 'other')}>
          {permission.action ? permission.action.charAt(0).toUpperCase() + permission.action.slice(1) : '-'}
        </Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (permission: Permission) => (
        <span className="text-sm text-muted-foreground">{permission.description || '-'}</span>
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

          <Button onClick={handleAdd}>
            <Plus />
            Add Permission
          </Button>
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
              actions={[
                {
                  label: "Edit",
                  onClick: (permission: Permission) => handleEdit(permission),
                  variant: "ghost" as const,
                },
                {
                  label: "Delete",
                  onClick: (permission: Permission) => handleDelete(permission),
                  variant: "ghost" as const,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Permission Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPermission ? "Edit Permission" : "Add New Permission"}</DialogTitle>
              <DialogDescription>
                {editingPermission ? "Update permission information" : "Create a new permission"}
              </DialogDescription>
            </DialogHeader>
            <PermissionForm
              initialData={editingPermission || undefined}
              onSubmit={handleSubmit}
              submitLabel={editingPermission ? "Save Changes" : "Create Permission"}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
