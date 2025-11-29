import type { ScreenPermission } from "@/types/tenant"

export interface JwtPayload {
  id: number
  site_id: number
  role: string
  permission: any[] // Empty array means all permissions
  iat: number
  exp: number
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
  role: string
  site_id: number
  org_id: number | null
  storeId?: number
  clientId?: number
  status: string
  created_at: string
  updated_at: string
  // Optional fields that might be added by frontend
  assignedStores?: string[]
  screenPermissions?: { screen: string; actions: string[] }[]
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
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
