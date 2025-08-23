import type { ScreenPermission } from "@/types/tenant"

export interface JwtPayload {
  userId: number
  clientId: number
  storeId: number
  role: string
  email: string
  name: string
  iat: number
  exp: number
}

export interface Permission {
  canView: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canAll: boolean
}

export interface ModulePermissions {
  [screenName: string]: Permission
}

export interface Permissions {
  [moduleName: string]: ModulePermissions
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  clientId: number
  storeId: number
  permissions: Permissions
  assignedStores?: string[]
  defaultStoreId?: string
  screenPermissions?: ScreenPermission[]
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: string
  assignedStores?: string[]
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordData {
  email: string
}

export interface AuthResponse {
  success: boolean
  token: string
  permissions: Permissions
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
