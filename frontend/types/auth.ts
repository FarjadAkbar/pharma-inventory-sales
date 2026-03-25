import type { ScreenPermission } from "@/types/tenant"

export interface JwtPayload {
  sub?: number        // JWT standard claim for subject (user ID)
  id?: number         // Legacy field, use sub if available
  site_id?: number
  role?: string
  roleId?: number
  roleName?: string
  email?: string
  name?: string
  /** Sites this user is deployed on */
  siteIds?: number[]
  /**
   * When true the user's role is site-scoped — they should only ever see
   * data that belongs to their siteIds.
   */
  isSiteScoped?: boolean
  permission?: any[]
  /** Mirrors identity-service JWT (resource.action permission names) */
  permissionNames?: string[]
  iat?: number
  exp?: number
}

export interface Permission {
  module: string
  actions: string[]
}

export interface ModulePermissions {
  [module: string]: string[]
}

export interface Permissions {
  [key: string]: ModulePermissions
}

export interface User {
  id: number
  fullname: string
  username: string
  email: string
  role: string | { id: number; name: string; isSiteScoped?: boolean; permissions?: Array<{ id: number; name: string }> }
  roleId?: number
  site_id: number
  org_id: number | null
  storeId?: number
  clientId?: number
  status: string
  created_at: string
  updated_at: string
  // Optional fields
  assignedStores?: string[]
  screenPermissions?: { screen: string; actions: string[] }[]
  /** Numeric IDs of sites this user is assigned to */
  siteIds?: number[]
  sites?: Array<{ id: number; name: string; address?: string; city?: string; type?: string }> | number[]
  /**
   * Whether the user's role restricts them to seeing only their site's data.
   * Derived from the role.isSiteScoped flag on the backend.
   */
  isSiteScoped?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordData {
  email: string
}

export interface AuthResponse {
  success: boolean
  token: string
  permissions: Permissions
  /** Site IDs from the login response */
  siteIds?: number[]
  /** Whether the logged-in user's role is site-scoped */
  isSiteScoped?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
