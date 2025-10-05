"use client"

import { useAuth } from "@/contexts/auth.context"
import type { ReactNode } from "react"

interface PermissionGuardProps {
  module: string
  action: string
  children: ReactNode
  fallback?: ReactNode
}

interface ModulePermissionGuardProps {
  module: string
  children: ReactNode
  fallback?: ReactNode
}

interface ActionButtonProps {
  module: string
  action: string
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

// Basic permission guard - renders children only if user has the specified permission
export function PermissionGuard({ module, action, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission, permissions } = useAuth()
  
  console.log('🔐 PermissionGuard Debug:', {
    module,
    action,
    permissions,
    hasPermission: hasPermission(module, action)
  })
  
  if (hasPermission(module, action)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Module permission guard - renders children only if user can view the module
export function ModulePermissionGuard({ module, children, fallback = null }: ModulePermissionGuardProps) {
  const { hasPermission } = useAuth()
  
  if (hasPermission(module, 'view')) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Action button - renders a button only if user has the specified permission
export function ActionButton({ 
  module, 
  action, 
  children, 
  onClick, 
  className = "",
  variant = "default",
  size = "default",
  disabled = false
}: ActionButtonProps) {
  const { hasPermission } = useAuth()
  
  if (!hasPermission(module, action)) {
    return null
  }
  
  return (
    <button
      onClick={onClick}
      className={className}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  )
}

// Multi-module permission guard - renders children if user has permission in ANY of the specified modules
export function MultiModulePermissionGuard({ 
  modules, 
  action, 
  children, 
  fallback = null 
}: {
  modules: string[]
  action: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const { hasPermission } = useAuth()
  
  console.log('🔐 MultiModulePermissionGuard Debug:', {
    modules,
    action,
    hasPermission: hasPermission
  })
  
  // Check if user has permission in any of the specified modules
  const hasAnyPermission = modules.some(module => {
    const result = hasPermission(module, action)
    console.log(`🔐 Checking ${module}.${action}:`, result)
    return result
  })
  
  console.log('🔐 MultiModulePermissionGuard Result:', hasAnyPermission)
  
  if (hasAnyPermission) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Permission-based icon renderer
export function PermissionIcon({ 
  module, 
  action, 
  icon: Icon, 
  fallback = null 
}: {
  module: string
  action: string
  icon: React.ComponentType<{ className?: string }>
  fallback?: ReactNode
}) {
  const { hasPermission } = useAuth()
  
  if (hasPermission(module, action)) {
    return <Icon className="h-4 w-4" />
  }
  
  return <>{fallback}</>
}

// Check if user has any permission for a module
export function useModulePermissions(module: string) {
  const { hasPermission, hasAllPermissions } = useAuth()
  
  return {
    canView: hasPermission(module, 'view'),
    canCreate: hasPermission(module, 'create'),
    canUpdate: hasPermission(module, 'update'),
    canDelete: hasPermission(module, 'delete'),
    canAll: hasAllPermissions(module, ['view', 'create', 'update', 'delete']),
    hasAnyPermission: hasPermission(module, 'view') || 
                      hasPermission(module, 'create') || 
                      hasPermission(module, 'update') || 
                      hasPermission(module, 'delete')
  }
}
