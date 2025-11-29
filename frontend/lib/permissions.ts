export type Role = "admin" | "store_manager" | "employee"
export type Permission =
  | "view_dashboard"
  | "view_products"
  | "create_products"
  | "edit_products"
  | "delete_products"
  | "view_vendors"
  | "create_vendors"
  | "edit_vendors"
  | "delete_vendors"
  | "view_categories"
  | "create_categories"
  | "edit_categories"
  | "delete_categories"
  | "view_sales"
  | "create_sales"
  | "view_pos"
  | "view_users"
  | "create_users"
  | "edit_users"
  | "delete_users"
  | "view_stores"
  | "create_stores"
  | "edit_stores"
  | "delete_stores"

// Role-based permissions mapping
export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "view_dashboard",
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",
    "view_vendors",
    "create_vendors",
    "edit_vendors",
    "delete_vendors",
    "view_categories",
    "create_categories",
    "edit_categories",
    "delete_categories",
    "view_sales",
    "create_sales",
    "view_pos",
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
    "view_stores",
    "create_stores",
    "edit_stores",
    "delete_stores",
  ],
  store_manager: [
    "view_dashboard",
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",
    "view_vendors",
    "create_vendors",
    "edit_vendors",
    "view_categories",
    "create_categories",
    "edit_categories",
    "delete_categories",
    "view_sales",
    "create_sales",
    "view_pos",
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
  ],
  employee: ["view_dashboard", "view_products", "view_pos", "create_sales"],
}

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

// Get all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? []
}

// Check if user can access a specific route
export function canAccessRoute(role: Role, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard": ["view_dashboard"],
    "/dashboard/products": ["view_products"],
    "/dashboard/vendors": ["view_vendors"],
    "/dashboard/categories": ["view_categories"],
    "/dashboard/sales": ["view_sales"],
    "/dashboard/pos": ["view_pos"],
    "/dashboard/users": ["view_users"],
    "/dashboard/stores": ["view_stores"],
  }

  const requiredPermissions = routePermissions[route]
  if (!requiredPermissions) return true // Allow access to routes without specific permissions

  return hasAnyPermission(role, requiredPermissions)
}
