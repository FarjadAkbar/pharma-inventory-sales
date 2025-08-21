"use client"

import type React from "react"

import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/lib/permissions"
import type { Role } from "@/types/tenant"

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
  roles?: Role[]
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  roles = [],
}: PermissionGuardProps) {
  const { can, canAny, canAll, role } = usePermissions()

  // Check role-based access
  if (roles.length > 0 && (!role || !roles.includes(role))) {
    return <>{fallback}</>
  }

  // Check single permission
  if (permission && !can(permission)) {
    return <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll ? canAll(permissions) : canAny(permissions)
    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
