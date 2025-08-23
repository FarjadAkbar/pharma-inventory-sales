"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, LoginCredentials, RegisterData, ChangePasswordData, ForgotPasswordData, Permissions } from "@/types/auth"
import { authService } from "@/services/auth.service"

interface AuthContextType {
  user: User | null
  loading: boolean
  permissions: Permissions | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  forgotPassword: (data: ForgotPasswordData) => Promise<void>
  isAuthenticated: boolean
  hasPermission: (module: string, screen: string, action: 'view' | 'create' | 'update' | 'delete') => boolean
  hasAllPermissions: (module: string, screen: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        const userPermissions = authService.getPermissions()
        setUser(userData)
        setPermissions(userPermissions)
      }
    } catch (error) {
      console.error("Auth initialization failed:", error)
      // Clear invalid token and reset state
      authService.removeToken()
      setUser(null)
      setPermissions(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    console.log("Auth context: Starting login process")
    setLoading(true)
    try {
      console.log("Auth context: Calling authService.login")
      const authResponse = await authService.login(credentials)
      console.log("Auth context: Login successful, authResponse:", authResponse)
      
      console.log("Auth context: Getting current user")
      const userData = await authService.getCurrentUser()
      console.log("Auth context: User data:", userData)
      
      console.log("Auth context: Setting user and permissions")
      setUser(userData)
      setPermissions(authResponse.permissions)
      console.log("Auth context: Login process completed successfully")
      console.log("Auth context: Current state - user:", !!userData, "permissions:", !!authResponse.permissions)
    } catch (error) {
      console.error("Auth context: Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)
    try {
      const authResponse = await authService.register(userData)
      const user = await authService.getCurrentUser()
      setUser(user)
      setPermissions(authResponse.permissions)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setPermissions(null)
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    await authService.changePassword(data)
  }

  const forgotPassword = async (data: ForgotPasswordData) => {
    await authService.forgotPassword(data)
  }

  const hasPermission = (module: string, screen: string, action: 'view' | 'create' | 'update' | 'delete'): boolean => {
    console.log('🔐 AuthContext hasPermission Debug:', {
      module,
      screen,
      action,
      permissions,
      user
    })
    const result = authService.hasPermission(module, screen, action)
    console.log('🔐 AuthContext hasPermission Result:', result)
    return result
  }

  const hasAllPermissions = (module: string, screen: string): boolean => {
    return authService.hasAllPermissions(module, screen)
  }

  const value: AuthContextType = {
    user,
    loading,
    permissions,
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    isAuthenticated: !!user,
    hasPermission,
    hasAllPermissions,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
