"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, Eye, Users, Package, ShoppingCart } from "lucide-react"
import { useAuth } from "@/contexts/auth.context"
import { 
  PermissionGuard, 
  ModulePermissionGuard, 
  ActionButton, 
  useScreenPermissions 
} from "@/components/auth/permission-guard"

export default function PermissionsDemoPage() {
  const { user, permissions } = useAuth()
  const [selectedRole, setSelectedRole] = useState("pos_staff")

  // Get permissions for different modules
  const posProductPermissions = useScreenPermissions("POS", "pos_product")
  const posCategoryPermissions = useScreenPermissions("POS", "pos_category")
  const pharmaProductPermissions = useScreenPermissions("PHARMA", "pharma_product")
  const userManagementPermissions = useScreenPermissions("USER_MANAGEMENT", "users")

  const roles = [
    { value: "pos_staff", label: "POS Staff", description: "Can manage POS products and categories" },
    { value: "pharma_staff", label: "Pharma Staff", description: "Can manage pharmaceutical products" },
    { value: "client_admin", label: "Client Admin", description: "Full access to all modules" },
  ]

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    // In a real app, this would update the user's role and permissions
    console.log("Role changed to:", role)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions Demo</h1>
          <p className="text-muted-foreground">
            This page demonstrates how the permission system works with different user roles
          </p>
        </div>

        {/* Role Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Role</CardTitle>
            <CardDescription>Select a role to see how permissions change</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant={selectedRole === role.value ? "default" : "outline"}
                  onClick={() => handleRoleChange(role.value)}
                >
                  {role.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {roles.find(r => r.value === selectedRole)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">User ID:</p>
                <p className="text-sm text-muted-foreground">{user?.id || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Role:</p>
                <p className="text-sm text-muted-foreground">{user?.role || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Client ID:</p>
                <p className="text-sm text-muted-foreground">{user?.clientId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Store ID:</p>
                <p className="text-sm text-muted-foreground">{user?.storeId || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* POS Module Permissions */}
        <ModulePermissionGuard module="POS" screen="pos_product">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                POS Module - Products
              </CardTitle>
              <CardDescription>
                This section shows POS product permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">View</p>
                    <Badge variant={posProductPermissions.canView ? "default" : "secondary"}>
                      {posProductPermissions.canView ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Create</p>
                    <Badge variant={posProductPermissions.canCreate ? "default" : "secondary"}>
                      {posProductPermissions.canCreate ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Update</p>
                    <Badge variant={posProductPermissions.canUpdate ? "default" : "secondary"}>
                      {posProductPermissions.canUpdate ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Delete</p>
                    <Badge variant={posProductPermissions.canDelete ? "default" : "secondary"}>
                      {posProductPermissions.canDelete ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  <PermissionGuard module="POS" screen="pos_product" action="create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="POS" screen="pos_product" action="view">
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Products
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="POS" screen="pos_product" action="update">
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Products
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="POS" screen="pos_product" action="delete">
                    <Button variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Products
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </CardContent>
          </Card>
        </ModulePermissionGuard>

        {/* POS Categories */}
        <ModulePermissionGuard module="POS" screen="pos_category">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                POS Module - Categories
              </CardTitle>
              <CardDescription>
                This section shows POS category permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">View</p>
                    <Badge variant={posCategoryPermissions.canView ? "default" : "secondary"}>
                      {posCategoryPermissions.canView ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Create</p>
                    <Badge variant={posCategoryPermissions.canCreate ? "default" : "secondary"}>
                      {posCategoryPermissions.canCreate ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Update</p>
                    <Badge variant={posCategoryPermissions.canUpdate ? "default" : "secondary"}>
                      {posCategoryPermissions.canUpdate ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Delete</p>
                    <Badge variant={posCategoryPermissions.canDelete ? "default" : "secondary"}>
                      {posCategoryPermissions.canDelete ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  <PermissionGuard module="POS" screen="pos_category" action="create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="POS" screen="pos_category" action="view">
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Categories
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="POS" screen="pos_category" action="update">
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Categories
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="POS" screen="pos_category" action="delete">
                    <Button variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Categories
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </CardContent>
          </Card>
        </ModulePermissionGuard>

        {/* Pharma Module */}
        <ModulePermissionGuard module="PHARMA" screen="pharma_product">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pharma Module - Products
              </CardTitle>
              <CardDescription>
                This section shows pharmaceutical product permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">View</p>
                    <Badge variant={pharmaProductPermissions.canView ? "default" : "secondary"}>
                      {pharmaProductPermissions.canView ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Create</p>
                    <Badge variant={pharmaProductPermissions.canCreate ? "default" : "secondary"}>
                      {pharmaProductPermissions.canCreate ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Update</p>
                    <Badge variant={pharmaProductPermissions.canUpdate ? "default" : "secondary"}>
                      {pharmaProductPermissions.canUpdate ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Delete</p>
                    <Badge variant={pharmaProductPermissions.canDelete ? "default" : "secondary"}>
                      {pharmaProductPermissions.canDelete ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  <PermissionGuard module="PHARMA" screen="pharma_product" action="create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Pharma Product
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="PHARMA" screen="pharma_product" action="view">
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Pharma Products
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="PHARMA" screen="pharma_product" action="update">
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Pharma Products
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="PHARMA" screen="pharma_product" action="delete">
                    <Button variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Pharma Products
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </CardContent>
          </Card>
        </ModulePermissionGuard>

        {/* User Management Module */}
        <ModulePermissionGuard module="USER_MANAGEMENT" screen="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management Module
              </CardTitle>
              <CardDescription>
                This section shows user management permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">View</p>
                    <Badge variant={userManagementPermissions.canView ? "default" : "secondary"}>
                      {userManagementPermissions.canView ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Create</p>
                    <Badge variant={userManagementPermissions.canCreate ? "default" : "secondary"}>
                      {userManagementPermissions.canCreate ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Update</p>
                    <Badge variant={userManagementPermissions.canUpdate ? "default" : "secondary"}>
                      {userManagementPermissions.canUpdate ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm font-medium">Delete</p>
                    <Badge variant={userManagementPermissions.canDelete ? "default" : "secondary"}>
                      {userManagementPermissions.canDelete ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  <PermissionGuard module="USER_MANAGEMENT" screen="users" action="create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="USER_MANAGEMENT" screen="users" action="view">
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Users
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="USER_MANAGEMENT" screen="users" action="update">
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Users
                    </Button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="USER_MANAGEMENT" screen="users" action="delete">
                    <Button variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Users
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </CardContent>
          </Card>
        </ModulePermissionGuard>

        {/* Raw Permissions Data */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Permissions Data</CardTitle>
            <CardDescription>
              This shows the complete permissions object for debugging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(permissions, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
