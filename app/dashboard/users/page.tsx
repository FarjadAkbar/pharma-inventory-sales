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
    fullname: "",
    username: "",
    email: "",
    password: "",
    role: "Warehouse Operations" as "System Administrator" | "Organization Administrator" | "Procurement Manager" | "Production Manager" | "Quality Control Manager" | "Quality Assurance Manager" | "Warehouse Operations" | "Distribution Operations" | "Sales Representative",
    site_id: 1,
    org_id: null as number | null,
  })

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
        // Handle direct backend response structure
        const users = Array.isArray(response.data) ? response.data : (response.data as any).users || []
        const paginationData = (response.data as any).pagination || { page: 1, pages: 1, total: users.length }
        
        setUsers(users)
        setPagination(paginationData)
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
    setFormData({ 
      fullname: "", 
      username: "", 
      email: "", 
      password: "", 
      role: "Warehouse Operations", 
      site_id: 1, 
      org_id: null 
    })
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
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      password: "", // Don't populate password for security
      role: user.role as "System Administrator" | "Organization Administrator" | "Procurement Manager" | "Production Manager" | "Quality Control Manager" | "Quality Assurance Manager" | "Warehouse Operations" | "Distribution Operations" | "Sales Representative",
      site_id: user.site_id,
      org_id: user.org_id,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.fullname}?`)) {
      try {
        await apiService.deleteUser(user.id.toString())
        fetchUsers()
        apiService.invalidateUsers()
      } catch (error) {
        console.error("Failed to delete user:", error)
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "System Administrator":
        return "bg-red-100 text-red-800"
      case "Organization Administrator":
        return "bg-purple-100 text-purple-800"
      case "Procurement Manager":
        return "bg-blue-100 text-blue-800"
      case "Production Manager":
        return "bg-indigo-100 text-indigo-800"
      case "Quality Control Manager":
        return "bg-yellow-100 text-yellow-800"
      case "Quality Assurance Manager":
        return "bg-orange-100 text-orange-800"
      case "Warehouse Operations":
        return "bg-green-100 text-green-800"
      case "Distribution Operations":
        return "bg-teal-100 text-teal-800"
      case "Sales Representative":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleDisplayName = (role: string) => {
    return role // Backend already returns display names
  }

  const calculateStats = () => {
    const adminCount = users.filter((user) => 
      user.role === "System Administrator" || user.role === "Organization Administrator"
    ).length
    const managerCount = users.filter((user) => 
      user.role === "Procurement Manager" || 
      user.role === "Production Manager" || 
      user.role === "Quality Control Manager" || 
      user.role === "Quality Assurance Manager"
    ).length
    const opsCount = users.filter((user) => 
      user.role === "Warehouse Operations" || 
      user.role === "Distribution Operations" || 
      user.role === "Sales Representative"
    ).length

    return { adminCount, managerCount, opsCount }
  }

  const stats = calculateStats()

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
      render: (user: User) => (
        <Badge className={getRoleBadgeColor(user.role)}>{getRoleDisplayName(user.role)}</Badge>
      ),
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
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
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
                    <SelectItem value="System Administrator">System Administrator</SelectItem>
                    <SelectItem value="Organization Administrator">Organization Administrator</SelectItem>
                    <SelectItem value="Procurement Manager">Procurement Manager</SelectItem>
                    <SelectItem value="Production Manager">Production Manager</SelectItem>
                    <SelectItem value="Quality Control Manager">Quality Control Manager</SelectItem>
                    <SelectItem value="Quality Assurance Manager">Quality Assurance Manager</SelectItem>
                    <SelectItem value="Warehouse Operations">Warehouse Operations</SelectItem>
                    <SelectItem value="Distribution Operations">Distribution Operations</SelectItem>
                    <SelectItem value="Sales Representative">Sales Representative</SelectItem>
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
