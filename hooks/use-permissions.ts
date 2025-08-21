"use client"

import { useAuth } from "@/contexts/auth.context"
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute as checkRouteAccess,
} from "@/lib/permissions"
import type { Permission } from "@/lib/permissions"
import type { Role } from "@/types/tenant"

export function usePermissions() {
  const { user } = useAuth()
  const userRole = user?.role as Role

  return {
    // Check single permission
    can: (permission: Permission): boolean => {
      if (!userRole) return false
      return hasPermission(userRole, permission)
    },

    // Check if user has any of the permissions
    canAny: (permissions: Permission[]): boolean => {
      if (!userRole) return false
      return hasAnyPermission(userRole, permissions)
    },

    // Check if user has all permissions
    canAll: (permissions: Permission[]): boolean => {
      if (!userRole) return false
      return hasAllPermissions(userRole, permissions)
    },

    // Check route access
    canAccessRoute: (route: string): boolean => {
      if (!userRole) return false
      return checkRouteAccess(userRole, route)
    },

    // Get user role
    role: userRole,

    // Check specific roles
    isAdmin: userRole === "admin",
    isStoreManager: userRole === "store_manager",
    isEmployee: userRole === "employee",

    // Check role hierarchy (admin > manager > user)
    isAtLeast: (role: Role): boolean => {
      if (!userRole) return false
      const hierarchy: Record<Role, number> = { user: 1, manager: 2, admin: 3 }
      return hierarchy[userRole] >= hierarchy[role]
    },
  }
}
