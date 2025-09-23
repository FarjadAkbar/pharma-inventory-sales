"use client"

import { useAuth } from "@/contexts/auth.context"
import { 
  hasPermission,
  hasFieldPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessModule,
  canAccessScreen,
  getCachedPermission,
  preloadPermissions,
  PHARMA_MODULES,
  PHARMA_SCREENS,
  PHARMA_ACTIONS,
  type PermissionSystem
} from "@/lib/enhanced-permissions"
import { useMemo, useEffect } from "react"

export function useEnhancedPermissions() {
  const { user } = useAuth()
  const userRole = user?.role || "employee"

  // Preload permissions on mount
  useEffect(() => {
    preloadPermissions(userRole)
  }, [userRole])

  return useMemo(() => ({
    // Basic permission checking
    can: (module: string, screen: string, action: string): boolean => {
      return getCachedPermission(userRole, module, screen, action)
    },

    // Field-level permission checking
    canViewField: (module: string, screen: string, field: string): boolean => {
      return hasFieldPermission(userRole, module, screen, field, 'view')
    },

    canEditField: (module: string, screen: string, field: string): boolean => {
      return hasFieldPermission(userRole, module, screen, field, 'edit')
    },

    // Multiple permission checking
    canAny: (module: string, screen: string, actions: string[]): boolean => {
      return hasAnyPermission(userRole, module, screen, actions)
    },

    canAll: (module: string, screen: string, actions: string[]): boolean => {
      return hasAllPermissions(userRole, module, screen, actions)
    },

    // Module and screen access
    canAccessModule: (module: string): boolean => {
      return canAccessModule(userRole, module)
    },

    canAccessScreen: (module: string, screen: string): boolean => {
      return canAccessScreen(userRole, module, screen)
    },

    // Role checking
    role: userRole,
    isSystemAdmin: userRole === "system_admin",
    isOrgAdmin: userRole === "org_admin",
    isProcurementManager: userRole === "procurement_manager",
    isProductionManager: userRole === "production_manager",
    isQCManager: userRole === "qc_manager",
    isQAManager: userRole === "qa_manager",
    isWarehouseOps: userRole === "warehouse_ops",
    isDistributionOps: userRole === "distribution_ops",
    isSalesRep: userRole === "sales_rep",

    // Role hierarchy checking
    isAtLeast: (role: string): boolean => {
      const hierarchy: Record<string, number> = {
        sales_rep: 1,
        warehouse_ops: 2,
        distribution_ops: 2,
        procurement_manager: 3,
        production_manager: 3,
        qc_manager: 3,
        qa_manager: 3,
        org_admin: 4,
        system_admin: 5,
      }
      return hierarchy[userRole] >= hierarchy[role]
    },

    // Convenience methods for common actions
    canView: (module: string, screen: string): boolean => {
      return getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.VIEW)
    },

    canCreate: (module: string, screen: string): boolean => {
      return getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.CREATE)
    },

    canEdit: (module: string, screen: string): boolean => {
      return getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.EDIT)
    },

    canDelete: (module: string, screen: string): boolean => {
      return getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.DELETE)
    },

    canApprove: (module: string, screen: string): boolean => {
      return getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.APPROVE)
    },

    canExport: (module: string, screen: string): boolean => {
      return getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.EXPORT)
    },

    canPrint: (module: string, screen: string): boolean => {
      return getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.PRINT)
    },

    // Screen-specific permission bundles
    getScreenPermissions: (module: string, screen: string) => {
      return {
        canView: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.VIEW),
        canCreate: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.CREATE),
        canEdit: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.EDIT),
        canDelete: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.DELETE),
        canApprove: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.APPROVE),
        canReject: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.REJECT),
        canExport: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.EXPORT),
        canPrint: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.PRINT),
        canVoid: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.VOID),
        canRenew: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.RENEW),
        canCancel: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.CANCEL),
        canComplete: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.COMPLETE),
        canRelease: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.RELEASE),
        canAssign: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.ASSIGN),
        canTransfer: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.TRANSFER),
        canProcess: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.PROCESS),
        canShip: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.SHIP),
        canTrack: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.TRACK),
        canMove: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.MOVE),
        canAdjust: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.ADJUST),
        canReverse: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.REVERSE),
        canExecute: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.EXECUTE),
        canStart: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.START),
        canInvestigate: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.INVESTIGATE),
        canClose: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.CLOSE),
        canVerify: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.VERIFY),
        canRate: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.RATE),
        canVersion: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.VERSION),
        canResetPassword: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.RESET_PASSWORD),
        canAssignPermissions: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.ASSIGN_PERMISSIONS),
      }
    },

    // Module-specific permission bundles
    getModulePermissions: (module: string) => {
      const screens = Object.values(PHARMA_SCREENS)
      const modulePermissions: Record<string, any> = {}

      screens.forEach(screen => {
        if (canAccessScreen(userRole, module, screen)) {
          modulePermissions[screen] = {
            canView: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.VIEW),
            canCreate: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.CREATE),
            canEdit: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.EDIT),
            canDelete: getCachedPermission(userRole, module, screen, PHARMA_ACTIONS.DELETE),
          }
        }
      })

      return modulePermissions
    },

    // Check if user has any permission for a module
    hasModuleAccess: (module: string): boolean => {
      return canAccessModule(userRole, module)
    },

    // Get all accessible modules
    getAccessibleModules: (): string[] => {
      return Object.values(PHARMA_MODULES).filter(module => 
        canAccessModule(userRole, module)
      )
    },

    // Get all accessible screens for a module
    getAccessibleScreens: (module: string): string[] => {
      return Object.values(PHARMA_SCREENS).filter(screen => 
        canAccessScreen(userRole, module, screen)
      )
    },

    // Check if user can perform any action on a screen
    hasAnyScreenPermission: (module: string, screen: string): boolean => {
      const commonActions = [
        PHARMA_ACTIONS.VIEW,
        PHARMA_ACTIONS.CREATE,
        PHARMA_ACTIONS.EDIT,
        PHARMA_ACTIONS.DELETE,
        PHARMA_ACTIONS.APPROVE,
        PHARMA_ACTIONS.EXPORT,
        PHARMA_ACTIONS.PRINT,
      ]

      return hasAnyPermission(userRole, module, screen, commonActions)
    },

    // Check if user can perform all basic actions on a screen
    hasAllScreenPermissions: (module: string, screen: string): boolean => {
      const basicActions = [
        PHARMA_ACTIONS.VIEW,
        PHARMA_ACTIONS.CREATE,
        PHARMA_ACTIONS.EDIT,
        PHARMA_ACTIONS.DELETE,
      ]

      return hasAllPermissions(userRole, module, screen, basicActions)
    },

    // Check if user can perform administrative actions
    canPerformAdminActions: (module: string, screen: string): boolean => {
      const adminActions = [
        PHARMA_ACTIONS.APPROVE,
        PHARMA_ACTIONS.REJECT,
        PHARMA_ACTIONS.ASSIGN_PERMISSIONS,
        PHARMA_ACTIONS.RESET_PASSWORD,
      ]

      return hasAnyPermission(userRole, module, screen, adminActions)
    },

    // Check if user can perform operational actions
    canPerformOperationalActions: (module: string, screen: string): boolean => {
      const operationalActions = [
        PHARMA_ACTIONS.PROCESS,
        PHARMA_ACTIONS.SHIP,
        PHARMA_ACTIONS.TRACK,
        PHARMA_ACTIONS.MOVE,
        PHARMA_ACTIONS.ADJUST,
        PHARMA_ACTIONS.EXECUTE,
        PHARMA_ACTIONS.START,
        PHARMA_ACTIONS.COMPLETE,
      ]

      return hasAnyPermission(userRole, module, screen, operationalActions)
    },

    // Check if user can perform quality actions
    canPerformQualityActions: (module: string, screen: string): boolean => {
      const qualityActions = [
        PHARMA_ACTIONS.APPROVE,
        PHARMA_ACTIONS.REJECT,
        PHARMA_ACTIONS.RELEASE,
        PHARMA_ACTIONS.INVESTIGATE,
        PHARMA_ACTIONS.CLOSE,
        PHARMA_ACTIONS.VERIFY,
      ]

      return hasAnyPermission(userRole, module, screen, qualityActions)
    },

    // Check if user can perform financial actions
    canPerformFinancialActions: (module: string, screen: string): boolean => {
      const financialActions = [
        PHARMA_ACTIONS.APPROVE,
        PHARMA_ACTIONS.REJECT,
        PHARMA_ACTIONS.VOID,
        PHARMA_ACTIONS.CANCEL,
        PHARMA_ACTIONS.RENEW,
      ]

      return hasAnyPermission(userRole, module, screen, financialActions)
    },

    // Get user's permission summary
    getPermissionSummary: () => {
      const accessibleModules = Object.values(PHARMA_MODULES).filter(module => 
        canAccessModule(userRole, module)
      )

      const summary = {
        role: userRole,
        accessibleModules: accessibleModules.length,
        totalModules: Object.values(PHARMA_MODULES).length,
        modules: accessibleModules.map(module => ({
          name: module,
          screens: Object.values(PHARMA_SCREENS).filter(screen => 
            canAccessScreen(userRole, module, screen)
          ).length,
        })),
        isSystemAdmin: userRole === "system_admin",
        isOrgAdmin: userRole === "org_admin",
        isManager: ["procurement_manager", "production_manager", "qc_manager", "qa_manager"].includes(userRole),
        isOperator: ["warehouse_ops", "distribution_ops", "sales_rep"].includes(userRole),
      }

      return summary
    },
  }), [userRole])
}

// Hook for checking specific module permissions
export function useModulePermissions(module: string) {
  const permissions = useEnhancedPermissions()

  return useMemo(() => ({
    canAccess: permissions.canAccessModule(module),
    accessibleScreens: permissions.getAccessibleScreens(module),
    modulePermissions: permissions.getModulePermissions(module),
    hasAnyPermission: permissions.hasModuleAccess(module),
  }), [permissions, module])
}

// Hook for checking specific screen permissions
export function useScreenPermissions(module: string, screen: string) {
  const permissions = useEnhancedPermissions()

  return useMemo(() => ({
    canAccess: permissions.canAccessScreen(module, screen),
    canView: permissions.canView(module, screen),
    canCreate: permissions.canCreate(module, screen),
    canEdit: permissions.canEdit(module, screen),
    canDelete: permissions.canDelete(module, screen),
    canApprove: permissions.canApprove(module, screen),
    canExport: permissions.canExport(module, screen),
    canPrint: permissions.canPrint(module, screen),
    screenPermissions: permissions.getScreenPermissions(module, screen),
    hasAnyPermission: permissions.hasAnyScreenPermission(module, screen),
    hasAllPermissions: permissions.hasAllScreenPermissions(module, screen),
    canPerformAdminActions: permissions.canPerformAdminActions(module, screen),
    canPerformOperationalActions: permissions.canPerformOperationalActions(module, screen),
    canPerformQualityActions: permissions.canPerformQualityActions(module, screen),
    canPerformFinancialActions: permissions.canPerformFinancialActions(module, screen),
  }), [permissions, module, screen])
}

// Hook for checking field-level permissions
export function useFieldPermissions(module: string, screen: string, field: string) {
  const permissions = useEnhancedPermissions()

  return useMemo(() => ({
    canView: permissions.canViewField(module, screen, field),
    canEdit: permissions.canEditField(module, screen, field),
    canAccess: permissions.canViewField(module, screen, field) || permissions.canEditField(module, screen, field),
  }), [permissions, module, screen, field])
}

// Hook for checking multiple permissions at once
export function useMultiplePermissions(permissionChecks: Array<{
  module: string;
  screen: string;
  action: string;
}>) {
  const permissions = useEnhancedPermissions()

  return useMemo(() => {
    return permissionChecks.map(({ module, screen, action }) => ({
      module,
      screen,
      action,
      can: permissions.can(module, screen, action),
    }))
  }, [permissions, permissionChecks])
}
