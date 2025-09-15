"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Shield, UserCheck } from "lucide-react"
import { apiService } from "@/services/api.service"
import type { User } from "@/types/auth"
import { useStore } from "@/contexts/store.context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { AccessDenied } from "@/components/ui/access-denied"
import { formatDateISO } from "@/lib/utils"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "warehouse_ops" as "system_admin" | "org_admin" | "procurement_manager" | "production_manager" | "qc_manager" | "qa_manager" | "warehouse_ops" | "distribution_ops" | "sales_rep",
    assignedStores: [] as string[],
    screenPermissions: [] as { screen: string; actions: string[] }[],
  })
  const { stores } = useStore()

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, pagination.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsers({
        search: searchQuery,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        // Type assertion for the response data structure
        const userData = response.data as {
          users: User[]
          pagination: { page: number; pages: number; total: number }
        }
        setUsers(userData.users || [])
        setPagination(userData.pagination || { page: 1, pages: 1, total: 0 })
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

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "warehouse_ops", assignedStores: [], screenPermissions: [] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await apiService.createUser(formData)
      setIsAddDialogOpen(false)
      resetForm()
      fetchUsers()
      apiService.invalidateUsers()
    } catch (error) {
      console.error("Failed to create user:", error)
    }
  }

  const handleEdit = (user: User) => {
    // For now, just open the add dialog with user data
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedStores: user.assignedStores || [],
      screenPermissions: user.screenPermissions || [],
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await apiService.deleteUser(user.id)
        fetchUsers()
        apiService.invalidateUsers()
      } catch (error) {
        console.error("Failed to delete user:", error)
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "system_admin":
        return "bg-red-100 text-red-800"
      case "org_admin":
        return "bg-purple-100 text-purple-800"
      case "procurement_manager":
        return "bg-blue-100 text-blue-800"
      case "production_manager":
        return "bg-indigo-100 text-indigo-800"
      case "qc_manager":
        return "bg-yellow-100 text-yellow-800"
      case "qa_manager":
        return "bg-orange-100 text-orange-800"
      case "warehouse_ops":
        return "bg-green-100 text-green-800"
      case "distribution_ops":
        return "bg-teal-100 text-teal-800"
      case "sales_rep":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "system_admin":
        return "System Admin"
      case "org_admin":
        return "Org Admin"
      case "procurement_manager":
        return "Procurement Manager"
      case "production_manager":
        return "Production Manager"
      case "qc_manager":
        return "QC Manager"
      case "qa_manager":
        return "QA Manager"
      case "warehouse_ops":
        return "Warehouse Ops"
      case "distribution_ops":
        return "Distribution Ops"
      case "sales_rep":
        return "Sales Rep"
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  const calculateStats = () => {
    const adminCount = users.filter((user) => user.role === "system_admin" || user.role === "org_admin").length
    const managerCount = users.filter((user) => 
      user.role === "procurement_manager" || 
      user.role === "production_manager" || 
      user.role === "qc_manager" || 
      user.role === "qa_manager"
    ).length
    const opsCount = users.filter((user) => 
      user.role === "warehouse_ops" || 
      user.role === "distribution_ops" || 
      user.role === "sales_rep"
    ).length

    return { adminCount, managerCount, opsCount }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "name",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) => (
        <Badge className={getRoleBadgeColor(user.role)}>{getRoleDisplayName(user.role)}</Badge>
      ),
    },
    { key: "createdAt", header: "Joined", render: (user: User) => formatDateISO(user.createdAt) },
    { key: "updatedAt", header: "Last Updated", render: (user: User) => formatDateISO(user.createdAt) },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage system users and their permissions</p>
          </div>

          <PermissionGuard module="USER_MANAGEMENT" screen="users" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/users/new") }>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.managerCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.opsCount}</div>
            </CardContent>
          </Card>
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
              actions={(user: User) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="USER_MANAGEMENT" screen="users" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard module="USER_MANAGEMENT" screen="users" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user)}>
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with specific role and permissions.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system_admin">System Admin</SelectItem>
                    <SelectItem value="org_admin">Org Admin</SelectItem>
                    <SelectItem value="procurement_manager">Procurement Manager</SelectItem>
                    <SelectItem value="production_manager">Production Manager</SelectItem>
                    <SelectItem value="qc_manager">QC Manager</SelectItem>
                    <SelectItem value="qa_manager">QA Manager</SelectItem>
                    <SelectItem value="warehouse_ops">Warehouse Ops</SelectItem>
                    <SelectItem value="distribution_ops">Distribution Ops</SelectItem>
                    <SelectItem value="sales_rep">Sales Rep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
