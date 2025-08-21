import type { ScreenPermission } from "@/types/tenant"
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "store_manager" | "employee"
  assignedStores?: string[]
  defaultStoreId?: string
  screenPermissions?: ScreenPermission[]
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: "admin" | "store_manager" | "employee"
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
  user: User
  token: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
