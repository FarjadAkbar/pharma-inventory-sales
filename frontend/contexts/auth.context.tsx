"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/auth"
import { authService } from "@/services/auth.service"

// ────────────────────────────────────────────────────────────────────────────
//  Context shape
// ────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user:        User | null
  loading:     boolean
  /** True when the user is logged in (token valid and user loaded). */
  isAuthenticated: boolean
  permissions: Record<string, any> | null

  // ── Site context ──────────────────────────────────────────────────────────
  /** Site IDs this user is assigned to */
  userSiteIds:  number[]
  /**
   * True when the user's role limits them to their own site(s) only
   * (Site Manager, Cashier, Pharmacist, Store Supervisor).
   */
  isSiteScoped: boolean

  // ── Auth actions ──────────────────────────────────────────────────────────
  login:          (email: string, password: string) => Promise<void>
  register:       (data: any) => Promise<void>
  logout:         () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword:  (token: string, newPassword: string) => Promise<void>

  // ── Permission helpers ────────────────────────────────────────────────────
  hasPermission:     (module: string, action: string) => boolean
  hasAllPermissions: (module: string, actions: string[]) => boolean

  // ── Site helpers ──────────────────────────────────────────────────────────
  /**
   * Returns a query-string fragment to filter API requests by the user's
   * site(s).  Returns "" for non-site-scoped roles.
   *
   * Example:  `/pos?${buildSiteFilter()}`
   */
  buildSiteFilter: () => string
  /**
   * Returns true when the given siteId is accessible to the current user.
   * System-wide roles always return true.
   */
  canAccessSite: (siteId: number) => boolean
}

// ────────────────────────────────────────────────────────────────────────────
//  Context
// ────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [user,        setUser]        = useState<User | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [permissions, setPermissions] = useState<Record<string, any> | null>(null)
  const [userSiteIds, setUserSiteIds] = useState<number[]>([])
  const [isSiteScoped, setIsSiteScoped] = useState(false)

  // ── Helpers ───────────────────────────────────────────────────────────────

  const syncSiteContext = useCallback(() => {
    const ctx = authService.getSiteContext()
    setUserSiteIds(ctx.siteIds)
    setIsSiteScoped(ctx.isSiteScoped)
  }, [])

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      console.log("🔐 AuthProvider: initialising")
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          setPermissions(authService.getPermissions())
          syncSiteContext()
        }
      } catch (error) {
        console.error("AuthProvider: init error", error)
        authService.removeToken()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [syncSiteContext])

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password })
    if (result.success) {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setPermissions(authService.getPermissions())
      syncSiteContext()
      router.push("/dashboard")
    } else {
      throw new Error("Login failed")
    }
  }

  const register = async (data: any) => {
    const result = await authService.register(data)
    if (result.success) {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setPermissions(authService.getPermissions())
      syncSiteContext()
      router.push("/dashboard")
    } else {
      throw new Error("Registration failed")
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setPermissions(null)
    setUserSiteIds([])
    setIsSiteScoped(false)
    router.push("/login")
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    await authService.changePassword({ currentPassword, newPassword, confirmPassword })
  }

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword({ email })
  }

  const resetPassword = async (token: string, newPassword: string) => {
    await authService.resetPassword(token, newPassword)
  }

  // ── Permission helpers ────────────────────────────────────────────────────

  const hasPermission = (module: string, action: string): boolean => {
    return authService.hasPermission(module, action)
  }

  const hasAllPermissions = (module: string, actions: string[]): boolean => {
    return authService.hasAllPermissions(module, actions)
  }

  // ── Site helpers ──────────────────────────────────────────────────────────

  const buildSiteFilter = (): string => authService.buildSiteFilter()

  const canAccessSite = (siteId: number): boolean => {
    if (!isSiteScoped) return true                  // system-wide role → all sites
    return userSiteIds.includes(siteId)
  }

  // ── Provider ──────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        permissions,
        userSiteIds,
        isSiteScoped,
        login,
        register,
        logout,
        changePassword,
        forgotPassword,
        resetPassword,
        hasPermission,
        hasAllPermissions,
        buildSiteFilter,
        canAccessSite,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ────────────────────────────────────────────────────────────────────────────
//  Hook
// ────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
