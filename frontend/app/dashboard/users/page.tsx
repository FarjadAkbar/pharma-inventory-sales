"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { usersApi } from "@/services"
import type { User } from "@/types/auth"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { formatDateISO } from "@/lib/utils"
import { UserForm } from "@/components/users/user-form"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, pagination.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await usersApi.getUsers({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })
      
      setUsers(response.users)
      if (response.pagination) {
        setPagination(response.pagination)
      } else {
        setPagination({ page: pagination.page, pages: 1, total: response.users.length })
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
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

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (data: {
    name: string
    email: string
    password?: string
    roleId?: number
    siteIds: number[]
  }) => {
    try {
      if (editingUser) {
        await usersApi.updateUser(editingUser.id.toString(), data)
      } else {
        await usersApi.createUser(data)
      }
      handleCloseModal()
      fetchUsers()
      usersApi.invalidateUsers()
    } catch (error) {
      console.error("Failed to save user:", error)
      throw error
    }
  }

  const handleDelete = async (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.fullname}?`)) {
      try {
        await usersApi.deleteUser(user.id.toString())
        fetchUsers()
        usersApi.invalidateUsers()
      } catch (error) {
        console.error("Failed to delete user:", error)
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    // Simple color scheme based on role name hash
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-yellow-100 text-yellow-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800",
      "bg-orange-100 text-orange-800",
    ]
    const hash = role.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const columns = [
    {
      key: "fullname",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.fullname
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="font-medium">{user.fullname}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) => {
        const roleName = typeof user.role === 'string' ? user.role : (user.role?.name || "No Role")
        return (
          <Badge className={getRoleBadgeColor(roleName)}>{roleName}</Badge>
        )
      },
    },
    { key: "created_at", header: "Joined", render: (user: User) => formatDateISO(user.created_at) },
    { key: "updated_at", header: "Last Updated", render: (user: User) => formatDateISO(user.updated_at) },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage system users and their permissions</p>
          </div>

          <PermissionGuard module="USER_MANAGEMENT" action="create">
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </PermissionGuard>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>A list of all users in the system with their roles and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search users..."
              actions={[
                {
                  label: "Edit",
                  onClick: (user: User) => handleEdit(user),
                  variant: "outline" as const,
                },
                {
                  label: "Delete",
                  onClick: (user: User) => handleDelete(user),
                  variant: "destructive" as const,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Add/Edit User Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user information" : "Create a new user account"}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              initialData={editingUser ? {
                ...editingUser,
                roleId: editingUser.roleId || (typeof editingUser.role === 'object' && editingUser.role?.id) || undefined,
                siteIds: editingUser.siteIds || (Array.isArray(editingUser.sites) 
                  ? editingUser.sites.map(s => typeof s === 'object' && 'id' in s ? s.id : (typeof s === 'number' ? s : 0)).filter(id => id > 0)
                  : []) || [],
              } : undefined}
              onSubmit={handleSubmit}
              submitLabel={editingUser ? "Save Changes" : "Create User"}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
