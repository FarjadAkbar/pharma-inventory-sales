"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Key } from "lucide-react"
import { rolesApi } from "@/services"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RoleForm } from "@/components/roles/role-form"

interface Role {
  id: number
  name: string
  description?: string
  permissions?: Array<{
    id: number
    name: string
    description?: string
    resource?: string
    action?: string
  }>
  createdAt: Date | string
  updatedAt: Date | string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [searchQuery, pagination.page])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await rolesApi.getRoles({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })

      // Backend returns array directly or wrapped in docs
      const rolesData = Array.isArray(response) ? response : (response?.docs || response?.data || [])
      setRoles(rolesData)
      
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
        setPagination({ page: 1, pages: 1, total: rolesData.length })
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
    setEditingRole(role)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingRole(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRole(null)
  }

  const handleSubmit = async (data: {
    name: string
    description?: string
    permissionIds: number[]
  }) => {
    try {
      if (editingRole) {
        // Update role details
        await rolesApi.updateRole(editingRole.id.toString(), {
          name: data.name,
          description: data.description,
        })
        
        // Get current role to compare permissions
        const currentRole = await rolesApi.getRole(editingRole.id.toString())
        const currentPermissionIds = currentRole.permissions?.map((p) => p.id) || []
        
        // Find permissions to add and remove
        const permissionsToAdd = data.permissionIds.filter(id => !currentPermissionIds.includes(id))
        const permissionsToRemove = currentPermissionIds.filter((id: number) => !data.permissionIds.includes(id))
        
        // Add new permissions
        for (const permissionId of permissionsToAdd) {
          try {
            await rolesApi.addPermissionToRole(editingRole.id.toString(), permissionId)
          } catch (error) {
            console.error(`Failed to add permission ${permissionId}:`, error)
          }
        }
        
        // Remove permissions
        for (const permissionId of permissionsToRemove) {
          try {
            await rolesApi.removePermissionFromRole(editingRole.id.toString(), permissionId)
          } catch (error) {
            console.error(`Failed to remove permission ${permissionId}:`, error)
          }
        }
      } else {
        // Create role first
        const role = await rolesApi.createRole({
          name: data.name,
          description: data.description,
        })
        
        // Then add permissions
        if (data.permissionIds.length > 0) {
          const roleId = role.id || role.data?.id
          if (roleId) {
            // Add permissions one by one
            for (const permissionId of data.permissionIds) {
              try {
                await rolesApi.addPermissionToRole(roleId.toString(), permissionId)
              } catch (error) {
                console.error(`Failed to add permission ${permissionId}:`, error)
              }
            }
          }
        }
      }
      
      handleCloseModal()
      fetchRoles()
    } catch (error) {
      console.error("Failed to save role:", error)
      throw error
    }
  }

  const handleDelete = async (role: Role) => {
    if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      try {
        await rolesApi.deleteRole(role.id.toString())
        fetchRoles()
      } catch (error) {
        console.error("Failed to delete role:", error)
      }
    }
  }

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
          {role.permissions && role.permissions.length > 0 ? (
            <>
              {role.permissions.slice(0, 3).map((permission) => (
                <Badge key={permission.id} variant="secondary" className="text-xs">
                  {permission.name}
                </Badge>
              ))}
              {role.permissions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{role.permissions.length - 3} more
                </Badge>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">No permissions</span>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (role: Role) => (
        <span className="text-sm text-muted-foreground">{role.description || "-"}</span>
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

          <PermissionGuard module="IDENTITY" action="create">
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </PermissionGuard>
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
              actions={[
                {
                  label: "Edit",
                  onClick: (role: Role) => handleEdit(role),
                  variant: "outline" as const,
                },
                {
                  label: "Delete",
                  onClick: (role: Role) => handleDelete(role),
                  variant: "destructive" as const,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Add/Edit Role Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
              <DialogDescription>
                {editingRole ? "Update role information and permissions" : "Create a new role and assign permissions"}
              </DialogDescription>
            </DialogHeader>
            <RoleForm
              initialData={editingRole || undefined}
              onSubmit={handleSubmit}
              submitLabel={editingRole ? "Save Changes" : "Create Role"}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
