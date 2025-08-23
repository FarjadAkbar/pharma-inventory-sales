"use client"

import { useAuth } from "@/contexts/auth.context"
import type { ReactNode } from "react"

interface PermissionGuardProps {
  module: string
  screen: string
  action: 'view' | 'create' | 'update' | 'delete'
  children: ReactNode
  fallback?: ReactNode
}

interface ModulePermissionGuardProps {
  module: string
  screen: string
  children: ReactNode
  fallback?: ReactNode
}

interface ActionButtonProps {
  module: string
  screen: string
  action: 'create' | 'update' | 'delete'
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

// Basic permission guard - renders children only if user has the specified permission
export function PermissionGuard({ module, screen, action, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission, permissions } = useAuth()
  
  console.log('🔐 PermissionGuard Debug:', {
    module,
    screen,
    action,
    permissions,
    hasPermission: hasPermission(module, screen, action)
  })
  
  if (hasPermission(module, screen, action)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Module permission guard - renders children only if user can view the screen
export function ModulePermissionGuard({ module, screen, children, fallback = null }: ModulePermissionGuardProps) {
  const { hasPermission } = useAuth()
  
  if (hasPermission(module, screen, 'view')) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Action button - renders a button only if user has the specified permission
export function ActionButton({ 
  module, 
  screen, 
  action, 
  children, 
  onClick, 
  className = "",
  variant = "default",
  size = "default",
  disabled = false
}: ActionButtonProps) {
  const { hasPermission } = useAuth()
  
  if (!hasPermission(module, screen, action)) {
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
  screen, 
  action, 
  children, 
  fallback = null 
}: {
  modules: string[]
  screen: string
  action: 'view' | 'create' | 'update' | 'delete'
  children: ReactNode
  fallback?: ReactNode
}) {
  const { hasPermission } = useAuth()
  
  // Check if user has permission in any of the specified modules
  const hasAnyPermission = modules.some(module => hasPermission(module, screen, action))
  
  if (hasAnyPermission) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Permission-based icon renderer
export function PermissionIcon({ 
  module, 
  screen, 
  action, 
  icon: Icon, 
  fallback = null 
}: {
  module: string
  screen: string
  action: 'view' | 'create' | 'update' | 'delete'
  icon: React.ComponentType<{ className?: string }>
  fallback?: ReactNode
}) {
  const { hasPermission } = useAuth()
  
  if (hasPermission(module, screen, action)) {
    return <Icon className="h-4 w-4" />
  }
  
  return <>{fallback}</>
}

// Check if user has any permission for a screen
export function useScreenPermissions(module: string, screen: string) {
  const { hasPermission, hasAllPermissions } = useAuth()
  
  return {
    canView: hasPermission(module, screen, 'view'),
    canCreate: hasPermission(module, screen, 'create'),
    canUpdate: hasPermission(module, screen, 'update'),
    canDelete: hasPermission(module, screen, 'delete'),
    canAll: hasAllPermissions(module, screen),
    hasAnyPermission: hasPermission(module, screen, 'view') || 
                      hasPermission(module, screen, 'create') || 
                      hasPermission(module, screen, 'update') || 
                      hasPermission(module, screen, 'delete')
  }
}
