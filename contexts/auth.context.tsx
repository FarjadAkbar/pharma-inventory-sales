"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, LoginCredentials, RegisterData, ChangePasswordData, ForgotPasswordData } from "@/types/auth"
import { authService } from "@/services/auth.service"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  forgotPassword: (data: ForgotPasswordData) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth initialization failed:", error)
      // Clear invalid token and reset state
      authService.removeToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    try {
      const authResponse = await authService.login(credentials)
      setUser(authResponse.user)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)
    try {
      const authResponse = await authService.register(userData)
      setUser(authResponse.user)
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    isAuthenticated: !!user,
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
