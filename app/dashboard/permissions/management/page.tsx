"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Shield, 
  Users, 
  Key, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Package,
  Factory,
  FlaskConical,
  Warehouse,
  Truck,
  TrendingUp,
  FileText,
  BarChart3,
  ShoppingCart,
} from "lucide-react"
import { useEnhancedPermissions } from "@/hooks/use-enhanced-permissions"
import { 
  PHARMA_MODULES, 
  PHARMA_SCREENS, 
  PHARMA_ACTIONS, 
  PHARMA_ROLES,
  ROLE_PERMISSIONS,
  type PermissionSystem 
} from "@/lib/enhanced-permissions"
import { formatDateISO } from "@/lib/utils"

interface Role {
  id: string
  name: string
  description: string
  permissions: PermissionSystem
  userCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: string
  name: string
  module: string
  screen: string
  action: string
  description: string
  category: string
  isActive: boolean
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: PermissionSystem
  lastLogin: string
  isActive: boolean
}

export default function PermissionManagementPage() {
  const [activeTab, setActiveTab] = useState("roles")
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editingPermissions, setEditingPermissions] = useState<Record<string, boolean>>({})
  const { role: userRole, isSystemAdmin, can } = useEnhancedPermissions()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Mock data - in real implementation, this would come from API
      const mockRoles: Role[] = [
        {
          id: "1",
          name: "System Admin",
          description: "Full system access with all permissions",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.SYSTEM_ADMIN],
          userCount: 2,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Org Admin",
          description: "Organization administration with limited system access",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.ORG_ADMIN],
          userCount: 5,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Procurement Manager",
          description: "Manages procurement processes and supplier relationships",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.PROCUREMENT_MANAGER],
          userCount: 8,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "4",
          name: "Production Manager",
          description: "Oversees manufacturing operations and batch production",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.PRODUCTION_MANAGER],
          userCount: 6,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "5",
          name: "QC Manager",
          description: "Manages quality control processes and testing",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.QC_MANAGER],
          userCount: 4,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "6",
          name: "QA Manager",
          description: "Oversees quality assurance and compliance",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.QA_MANAGER],
          userCount: 3,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "7",
          name: "Warehouse Ops",
          description: "Manages warehouse operations and inventory",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.WAREHOUSE_OPS],
          userCount: 12,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "8",
          name: "Distribution Ops",
          description: "Handles distribution and shipping operations",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.DISTRIBUTION_OPS],
          userCount: 10,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "9",
          name: "Sales Rep",
          description: "Manages sales activities and customer relationships",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.SALES_REP],
          userCount: 15,
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ]

      const mockPermissions: Permission[] = Object.entries(PHARMA_MODULES).flatMap(([moduleKey, moduleValue]) =>
        Object.entries(PHARMA_SCREENS).map(([screenKey, screenValue]) =>
          Object.entries(PHARMA_ACTIONS).map(([actionKey, actionValue]) => ({
            id: `${moduleValue}_${screenValue}_${actionValue}`,
            name: `${actionValue.charAt(0).toUpperCase() + actionValue.slice(1)} ${screenValue.replace(/_/g, ' ')}`,
            module: moduleValue,
            screen: screenValue,
            action: actionValue,
            description: `Permission to ${actionValue} ${screenValue.replace(/_/g, ' ')} in ${moduleValue.replace(/_/g, ' ')}`,
            category: moduleValue,
            isActive: true,
            createdAt: "2024-01-01T00:00:00Z",
          }))
        ).flat()
      ).flat()

      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Admin",
          email: "john.admin@pharma.com",
          role: "System Admin",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.SYSTEM_ADMIN],
          lastLogin: "2024-01-15T10:30:00Z",
          isActive: true,
        },
        {
          id: "2",
          name: "Jane Manager",
          email: "jane.manager@pharma.com",
          role: "Org Admin",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.ORG_ADMIN],
          lastLogin: "2024-01-15T09:15:00Z",
          isActive: true,
        },
        {
          id: "3",
          name: "Bob Procurement",
          email: "bob.procurement@pharma.com",
          role: "Procurement Manager",
          permissions: ROLE_PERMISSIONS[PHARMA_ROLES.PROCUREMENT_MANAGER],
          lastLogin: "2024-01-15T08:45:00Z",
          isActive: true,
        },
      ]

      setRoles(mockRoles)
      setPermissions(mockPermissions)
      setUsers(mockUsers)
    } catch (error) {
      console.error("Failed to fetch permission data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setActiveTab("permissions")
  }

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setEditingPermissions(prev => ({
      ...prev,
      [permissionId]: checked
    }))
  }

  const handleSavePermissions = () => {
    // In real implementation, this would save to API
    console.log("Saving permissions:", editingPermissions)
    setEditingPermissions({})
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case PHARMA_MODULES.IDENTITY:
        return <Shield className="h-4 w-4" />
      case PHARMA_MODULES.MASTER_DATA:
        return <Package className="h-4 w-4" />
      case PHARMA_MODULES.PROCUREMENT:
        return <ShoppingCart className="h-4 w-4" />
      case PHARMA_MODULES.MANUFACTURING:
        return <Factory className="h-4 w-4" />
      case PHARMA_MODULES.QUALITY_CONTROL:
        return <FlaskConical className="h-4 w-4" />
      case PHARMA_MODULES.QUALITY_ASSURANCE:
        return <CheckCircle className="h-4 w-4" />
      case PHARMA_MODULES.WAREHOUSE:
        return <Warehouse className="h-4 w-4" />
      case PHARMA_MODULES.DISTRIBUTION:
        return <Truck className="h-4 w-4" />
      case PHARMA_MODULES.SALES:
        return <TrendingUp className="h-4 w-4" />
      case PHARMA_MODULES.REGULATORY:
        return <FileText className="h-4 w-4" />
      case PHARMA_MODULES.REPORTING:
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "System Admin":
        return "bg-red-100 text-red-800"
      case "Org Admin":
        return "bg-purple-100 text-purple-800"
      case "Procurement Manager":
        return "bg-blue-100 text-blue-800"
      case "Production Manager":
        return "bg-green-100 text-green-800"
      case "QC Manager":
        return "bg-yellow-100 text-yellow-800"
      case "QA Manager":
        return "bg-orange-100 text-orange-800"
      case "Warehouse Ops":
        return "bg-gray-100 text-gray-800"
      case "Distribution Ops":
        return "bg-indigo-100 text-indigo-800"
      case "Sales Rep":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const rolesColumns = [
    {
      key: "name",
      header: "Role",
      render: (role: Role) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{role.name}</div>
            <div className="text-sm text-muted-foreground">{role.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: "users",
      header: "Users",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{role.userCount}</span>
        </div>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (role: Role) => {
        const totalPermissions = Object.values(role.permissions.modules).reduce(
          (total, module) => total + Object.values(module.screens).reduce(
            (screenTotal, screen) => screenTotal + Object.values(screen.actions).filter(Boolean).length,
            0
          ),
          0
        )
        return (
          <div className="text-sm">
            <div className="font-medium">{totalPermissions} permissions</div>
            <div className="text-muted-foreground">Across all modules</div>
          </div>
        )
      },
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
    {
      key: "actions",
      header: "Actions",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRoleSelect(role)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {isSystemAdmin && (
            <Button variant="ghost" size="sm">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ]

  const usersColumns = [
    {
      key: "user",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
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
        <Badge className={getRoleBadgeColor(user.role)}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      render: (user: User) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{formatDateISO(user.lastLogin)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <Badge variant={user.isActive ? "default" : "secondary"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {isSystemAdmin && (
            <Button variant="ghost" size="sm">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ]

  const renderPermissionMatrix = () => {
    if (!selectedRole) return null

    const modules = Object.entries(PHARMA_MODULES)
    const screens = Object.entries(PHARMA_SCREENS)
    const actions = Object.entries(PHARMA_ACTIONS)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Permission Matrix for {selectedRole.name}</h3>
            <p className="text-sm text-muted-foreground">
              Configure permissions for {selectedRole.name} role
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setSelectedRole(null)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={handleSavePermissions}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {modules.map(([moduleKey, moduleValue]) => (
            <Card key={moduleValue}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getModuleIcon(moduleValue)}
                  {moduleValue.replace(/_/g, ' ').toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {screens.map(([screenKey, screenValue]) => (
                    <div key={screenValue} className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">
                        {screenValue.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <div className="grid grid-cols-4 gap-4">
                        {actions.map(([actionKey, actionValue]) => {
                          const permissionId = `${moduleValue}_${screenValue}_${actionValue}`
                          const hasPermission = selectedRole.permissions.modules[moduleValue]?.screens[screenValue]?.actions[actionValue] || false
                          
                          return (
                            <div key={actionValue} className="flex items-center space-x-2">
                              <Checkbox
                                id={permissionId}
                                checked={editingPermissions[permissionId] !== undefined ? editingPermissions[permissionId] : hasPermission}
                                onCheckedChange={(checked) => handlePermissionToggle(permissionId, checked as boolean)}
                              />
                              <Label htmlFor={permissionId} className="text-sm">
                                {actionValue.charAt(0).toUpperCase() + actionValue.slice(1)}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
            <p className="text-muted-foreground">Manage roles, permissions, and user access</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Roles</CardTitle>
                <CardDescription>Manage system roles and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={roles}
                  columns={rolesColumns}
                  loading={loading}
                  onSearch={setSearchQuery}
                  searchPlaceholder="Search roles..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            {selectedRole ? (
              renderPermissionMatrix()
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Permission Matrix</CardTitle>
                  <CardDescription>Select a role to view and edit its permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a role from the Roles tab to view its permissions</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage user accounts and their role assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={users}
                  columns={usersColumns}
                  loading={loading}
                  onSearch={setSearchQuery}
                  searchPlaceholder="Search users..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
