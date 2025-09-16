"use client"

import { useEnhancedPermissions } from "@/hooks/use-enhanced-permissions"
import type { ReactNode } from "react"

interface EnhancedPermissionGuardProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean // If true, requires all permissions to be true
}

interface MultiPermissionGuardProps {
  permissions: Array<{
    module: string
    screen: string
    action: string
  }>
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean // If true, requires all permissions to be true
}

interface FieldPermissionGuardProps {
  module: string
  screen: string
  field: string
  permission: 'view' | 'edit'
  children: ReactNode
  fallback?: ReactNode
}

interface RoleBasedGuardProps {
  roles: string[]
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean // If true, requires user to have all roles
}

interface ActionBasedGuardProps {
  module: string
  screen: string
  actions: string[]
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean // If true, requires all actions to be permitted
}

interface ModuleAccessGuardProps {
  module: string
  children: ReactNode
  fallback?: ReactNode
}

interface ScreenAccessGuardProps {
  module: string
  screen: string
  children: ReactNode
  fallback?: ReactNode
}

// Enhanced permission guard with caching and optimization
export function EnhancedPermissionGuard({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null,
  requireAll = false
}: EnhancedPermissionGuardProps) {
  const { can } = useEnhancedPermissions()
  
  const hasPermission = can(module, screen, action)
  
  if (hasPermission) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Multi-permission guard - checks multiple permissions
export function MultiPermissionGuard({ 
  permissions, 
  children, 
  fallback = null,
  requireAll = false
}: MultiPermissionGuardProps) {
  const { can } = useEnhancedPermissions()
  
  const hasPermissions = requireAll 
    ? permissions.every(({ module, screen, action }) => can(module, screen, action))
    : permissions.some(({ module, screen, action }) => can(module, screen, action))
  
  if (hasPermissions) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Field-level permission guard
export function FieldPermissionGuard({ 
  module, 
  screen, 
  field, 
  permission, 
  children, 
  fallback = null
}: FieldPermissionGuardProps) {
  const { canViewField, canEditField } = useEnhancedPermissions()
  
  const hasFieldPermission = permission === 'view' 
    ? canViewField(module, screen, field)
    : canEditField(module, screen, field)
  
  if (hasFieldPermission) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Role-based guard
export function RoleBasedGuard({ 
  roles, 
  children, 
  fallback = null,
  requireAll = false
}: RoleBasedGuardProps) {
  const { role, isAtLeast } = useEnhancedPermissions()
  
  const hasRole = requireAll
    ? roles.every(requiredRole => isAtLeast(requiredRole))
    : roles.some(requiredRole => isAtLeast(requiredRole))
  
  if (hasRole) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Action-based guard - checks multiple actions on same screen
export function ActionBasedGuard({ 
  module, 
  screen, 
  actions, 
  children, 
  fallback = null,
  requireAll = false
}: ActionBasedGuardProps) {
  const { canAny, canAll } = useEnhancedPermissions()
  
  const hasActions = requireAll 
    ? canAll(module, screen, actions)
    : canAny(module, screen, actions)
  
  if (hasActions) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Module access guard
export function ModuleAccessGuard({ 
  module, 
  children, 
  fallback = null
}: ModuleAccessGuardProps) {
  const { canAccessModule } = useEnhancedPermissions()
  
  if (canAccessModule(module)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Screen access guard
export function ScreenAccessGuard({ 
  module, 
  screen, 
  children, 
  fallback = null
}: ScreenAccessGuardProps) {
  const { canAccessScreen } = useEnhancedPermissions()
  
  if (canAccessScreen(module, screen)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Permission-aware button component
interface PermissionButtonProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  fallback?: ReactNode
}

export function PermissionButton({ 
  module, 
  screen, 
  action, 
  children, 
  onClick, 
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  fallback = null
}: PermissionButtonProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
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

// Permission-aware form field component
interface PermissionFormFieldProps {
  module: string
  screen: string
  field: string
  children: ReactNode
  fallback?: ReactNode
  hideIfNoView?: boolean // Hide completely if no view permission
  disableIfNoEdit?: boolean // Disable if no edit permission
}

export function PermissionFormField({ 
  module, 
  screen, 
  field, 
  children, 
  fallback = null,
  hideIfNoView = false,
  disableIfNoEdit = false
}: PermissionFormFieldProps) {
  const { canViewField, canEditField } = useEnhancedPermissions()
  
  const canView = canViewField(module, screen, field)
  const canEdit = canEditField(module, screen, field)
  
  if (!canView && hideIfNoView) {
    return <>{fallback}</>
  }
  
  if (!canView) {
    return <>{fallback}</>
  }
  
  // Clone children and add disabled prop if needed
  if (disableIfNoEdit && !canEdit) {
    return (
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    )
  }
  
  return <>{children}</>
}

// Permission-aware table column component
interface PermissionTableColumnProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionTableColumn({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null
}: PermissionTableColumnProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Permission-aware navigation item component
interface PermissionNavItemProps {
  module: string
  screen: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionNavItem({ 
  module, 
  screen, 
  children, 
  fallback = null
}: PermissionNavItemProps) {
  const { canAccessScreen } = useEnhancedPermissions()
  
  if (!canAccessScreen(module, screen)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Permission-aware icon component
interface PermissionIconProps {
  module: string
  screen: string
  action: string
  icon: React.ComponentType<{ className?: string }>
  fallback?: ReactNode
  className?: string
}

export function PermissionIcon({ 
  module, 
  screen, 
  action, 
  icon: Icon, 
  fallback = null,
  className = "h-4 w-4"
}: PermissionIconProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  return <Icon className={className} />
}

// Permission-aware badge component
interface PermissionBadgeProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function PermissionBadge({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null,
  className = ""
}: PermissionBadgeProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  return (
    <span className={className}>
      {children}
    </span>
  )
}

// Permission-aware dropdown menu item
interface PermissionDropdownItemProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionDropdownItem({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null
}: PermissionDropdownItemProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Permission-aware card component
interface PermissionCardProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function PermissionCard({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null,
  className = ""
}: PermissionCardProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Permission-aware section component
interface PermissionSectionProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function PermissionSection({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null,
  className = ""
}: PermissionSectionProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  return (
    <section className={className}>
      {children}
    </section>
  )
}

// Permission-aware tooltip component
interface PermissionTooltipProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  content?: string
}

export function PermissionTooltip({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null,
  content
}: PermissionTooltipProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  return (
    <div title={content}>
      {children}
    </div>
  )
}

// Permission-aware modal component
interface PermissionModalProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export function PermissionModal({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null,
  isOpen = false,
  onClose
}: PermissionModalProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  if (!isOpen) {
    return null
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {children}
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}

// Permission-aware loading component
interface PermissionLoadingProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  loading?: boolean
}

export function PermissionLoading({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null,
  loading = false
}: PermissionLoadingProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return <>{children}</>
}

// Permission-aware error boundary component
interface PermissionErrorBoundaryProps {
  module: string
  screen: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  error?: Error | null
}

export function PermissionErrorBoundary({ 
  module, 
  screen, 
  action, 
  children, 
  fallback = null,
  error = null
}: PermissionErrorBoundaryProps) {
  const { can } = useEnhancedPermissions()
  
  if (!can(module, screen, action)) {
    return <>{fallback}</>
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error: {error.message}</p>
      </div>
    )
  }
  
  return <>{children}</>
}
