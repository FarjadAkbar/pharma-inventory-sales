import type {
  User,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ForgotPasswordData,
  AuthResponse,
  ApiResponse,
  JwtPayload,
  Permissions,
} from "@/types/auth"
import { decodeToken, extractUserFromToken, isTokenValid } from "@/lib/jwt"
import { checkPermission } from "@/lib/rbac"
import { apiService } from "./api.service"
import { BASE_URL } from "@/config"

class AuthService {
  private tokenKey        = "pharma_inventory_sales_token"
  private refreshTokenKey = "pharma_inventory_sales_refresh_token"
  private permissionsKey  = "pharma_inventory_sales_permissions"
  private permissionNamesKey = "pharma_inventory_sales_permission_names"
  private siteContextKey  = "pharma_inventory_sales_site_context"   // { siteIds, isSiteScoped }

  // ── Token management ──────────────────────────────────────────────────────

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token)
      // Do not mirror the full JWT into document.cookie — large payloads (many permissions)
      // exceed browser cookie limits (~4KB) and the cookie is dropped, so Next middleware
      // would redirect to login while localStorage still holds a valid token.
    }
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.tokenKey)
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.refreshTokenKey)
      localStorage.removeItem(this.permissionsKey)
      localStorage.removeItem(this.permissionNamesKey)
      localStorage.removeItem(this.siteContextKey)
      document.cookie = `${this.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
  }

  // ── Refresh token ─────────────────────────────────────────────────────────

  setRefreshToken(token: string): void {
    if (typeof window !== "undefined") localStorage.setItem(this.refreshTokenKey, token)
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.refreshTokenKey)
  }

  // ── Permissions ───────────────────────────────────────────────────────────

  setPermissions(permissions: Permissions): void {
    if (typeof window !== "undefined")
      localStorage.setItem(this.permissionsKey, JSON.stringify(permissions))
  }

  getPermissions(): Permissions | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem(this.permissionsKey)
    return raw ? JSON.parse(raw) : null
  }

  setPermissionNames(names: string[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.permissionNamesKey, JSON.stringify(names))
    }
  }

  getPermissionNames(): string[] {
    if (typeof window === "undefined") return []
    const raw = localStorage.getItem(this.permissionNamesKey)
    if (!raw) return []
    try {
      const v = JSON.parse(raw) as unknown
      return Array.isArray(v) ? (v as string[]) : []
    } catch {
      return []
    }
  }

  /** Hydrate client permission cache from JWT `permissionNames` or after login. */
  hydratePermissionNamesFromJwt(): void {
    const payload = this.getUserFromToken()
    const names = payload?.permissionNames
    if (Array.isArray(names) && names.length) {
      this.syncPermissionsFromRole(names.map((name) => ({ name: String(name) })))
    }
  }

  private syncPermissionsFromRole(
    permArray: Array<{ name: string }> | undefined,
  ): void {
    const names = permArray?.map((p) => p.name) ?? []
    this.setPermissionNames(names)

    const permissions: Permissions = {}
    permArray?.forEach((p) => {
      const [resource, action] = p.name.split(".")
      if (!resource || !action) return
      if (!permissions[resource]) permissions[resource] = {}
      if (!permissions[resource][resource]) permissions[resource][resource] = []
      ;(permissions[resource][resource] as string[]).push(action)
    })
    this.setPermissions(permissions)
  }

  // ── Site context (siteIds + isSiteScoped) ─────────────────────────────────

  setSiteContext(siteIds: number[], isSiteScoped: boolean): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.siteContextKey, JSON.stringify({ siteIds, isSiteScoped }))
    }
  }

  getSiteContext(): { siteIds: number[]; isSiteScoped: boolean } {
    if (typeof window === "undefined") return { siteIds: [], isSiteScoped: false }
    try {
      const raw = localStorage.getItem(this.siteContextKey)
      if (!raw) return { siteIds: [], isSiteScoped: false }
      const { siteIds = [], isSiteScoped = false } = JSON.parse(raw)
      return { siteIds, isSiteScoped }
    } catch {
      return { siteIds: [], isSiteScoped: false }
    }
  }

  /** Convenience: returns the user's assigned site IDs */
  getUserSiteIds(): number[] {
    // Prefer stored context; fall back to JWT
    const stored = this.getSiteContext().siteIds
    if (stored.length) return stored
    const payload = this.getUserFromToken()
    return payload?.siteIds ?? []
  }

  /**
   * Returns true when the logged-in user's role restricts them to their
   * assigned site(s) only (Site Manager, Cashier, etc.).
   */
  isSiteScoped(): boolean {
    const stored = this.getSiteContext().isSiteScoped
    if (stored) return true
    return this.getUserFromToken()?.isSiteScoped ?? false
  }

  // ── Authentication methods ────────────────────────────────────────────────

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("AuthService: Starting login")
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || "Login failed")
      }

      const data = await response.json()
      console.log("AuthService: Login API response received")

      if (data.accessToken) {
        this.setToken(data.accessToken)
        this.setRefreshToken(data.refreshToken)

        // Extract site context from login response
        const siteIds: number[]      = data.user?.siteIds     ?? []
        const isSiteScoped: boolean  = data.user?.isSiteScoped ?? false
        this.setSiteContext(siteIds, isSiteScoped)

        const roleObj =
          data.user?.role && typeof data.user.role === "object"
            ? data.user.role
            : null
        if (roleObj?.permissions) {
          this.syncPermissionsFromRole(roleObj.permissions)
        } else {
          this.hydratePermissionNamesFromJwt()
          if (!this.getPermissionNames().length) {
            this.syncPermissionsFromRole(undefined)
          }
        }

        const permissions = this.getPermissions() ?? {}

        return {
          success: true,
          token: data.accessToken,
          permissions,
          siteIds,
          isSiteScoped,
        }
      }

      throw new Error("Login failed")
    } catch (error) {
      console.error("AuthService Login error:", error)
      throw error instanceof Error ? error : new Error("Login failed")
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>("/register", userData)
    if (response.success && response.token) {
      this.setToken(response.token)
      this.setPermissions(response.permissions)
      return response
    }
    throw new Error("Registration failed")
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        this.removeToken()
        return null
      }

      const data = await response.json()
      if (data.accessToken && data.refreshToken) {
        this.setToken(data.accessToken)
        this.setRefreshToken(data.refreshToken)
        return { accessToken: data.accessToken, refreshToken: data.refreshToken }
      }

      return null
    } catch (error) {
      console.error("Token refresh failed:", error)
      this.removeToken()
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
      }
    } catch (error) {
      console.error("Logout request failed:", error)
    } finally {
      this.removeToken()
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken()

      if (token) {
        const response = await fetch(`${BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          const transformed = this.transformUserResponse(userData)

          // Keep site context in sync with the latest user data
          if (userData.siteIds?.length || userData.role?.isSiteScoped !== undefined) {
            this.setSiteContext(
              userData.siteIds ?? [],
              userData.role?.isSiteScoped ?? false,
            )
          }

          if (userData.role?.permissions) {
            this.syncPermissionsFromRole(userData.role.permissions)
          }

          return transformed
        } else if (response.status === 401) {
          this.removeToken()
          throw new Error("Unauthorized: Please login again")
        }
      }

      // Fallback to JWT
      const user = this.getUserFromToken()
      if (!user) throw new Error("No user found")

      const userId = user.sub || user.id

      return {
        id: userId || 0,
        fullname: user.name || "",
        username: user.email || "",
        email: user.email || "",
        role: user.roleName || user.role || "",
        site_id: user.siteIds?.[0] ?? user.site_id ?? 0,
        org_id: null,
        clientId: 1,
        storeId: user.siteIds?.[0] ?? user.site_id ?? 0,
        status: "active",
        siteIds: user.siteIds ?? [],
        isSiteScoped: user.isSiteScoped ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Failed to get current user:", error)
      throw error instanceof Error ? error : new Error("Failed to get current user")
    }
  }

  private transformUserResponse(userData: any): User {
    const siteIds: number[] = userData.siteIds ?? []
    const isSiteScoped: boolean = userData.role?.isSiteScoped ?? false

    return {
      id: userData.id,
      fullname: userData.name || "",
      username: userData.email || "",
      email: userData.email || "",
      role: userData.role?.name || userData.role || "",
      site_id: siteIds[0] ?? 0,
      org_id: userData.org_id || null,
      clientId: 1,
      storeId: siteIds[0] ?? 0,
      status: "active",
      siteIds,
      isSiteScoped,
      created_at: userData.createdAt
        ? new Date(userData.createdAt).toISOString()
        : new Date().toISOString(),
      updated_at: userData.updatedAt
        ? new Date(userData.updatedAt).toISOString()
        : new Date().toISOString(),
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiService.post("/change-password", data)
    if (!response.success) throw new Error("Password change failed")
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await apiService.post("/forgot-password", data)
    if (!response.success) throw new Error("Password reset request failed")
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiService.post("/reset-password", { token, newPassword })
    if (!response.success) throw new Error("Password reset failed")
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  isAuthenticated(): boolean {
    const token = this.getToken()
    return token ? isTokenValid(token) : false
  }

  getUserFromToken(): JwtPayload | null {
    const token = this.getToken()
    return token ? extractUserFromToken(token) : null
  }

  hasPermission(moduleOrResource: string, action: string): boolean {
    const names = this.getPermissionNames()
    if (!names.length) return false
    return checkPermission(names, moduleOrResource, action)
  }

  hasAllPermissions(moduleOrResource: string, actions: string[]): boolean {
    return actions.every((action) => this.hasPermission(moduleOrResource, action))
  }

  /**
   * Build a URLSearchParams snippet that adds siteId filters when the
   * current user is site-scoped.  Append to any data-fetching API call.
   *
   * Example:
   *   const siteFilter = authService.buildSiteFilter()
   *   fetch(`/api/pos?${siteFilter}`)
   */
  buildSiteFilter(): string {
    if (!this.isSiteScoped()) return ""
    const ids = this.getUserSiteIds()
    if (!ids.length) return ""
    const params = new URLSearchParams()
    ids.forEach(id => params.append("siteIds", String(id)))
    return params.toString()
  }
}

export const authService = new AuthService()
