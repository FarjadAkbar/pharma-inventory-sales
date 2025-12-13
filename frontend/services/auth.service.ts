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
import { apiService } from "./api.service"
import { BASE_URL } from "@/config"

class AuthService {
  private baseUrl = "/api/auth"
  private tokenKey = "pharma_inventory_sales_token"
  private refreshTokenKey = "pharma_inventory_sales_refresh_token"
  private permissionsKey = "pharma_inventory_sales_permissions"

  // Token management
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token)
      // Also set cookie for middleware access
      document.cookie = `${this.tokenKey}=${token}; path=/; max-age=${24 * 60 * 60}; samesite=strict`
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
      // Also remove cookie
      document.cookie = `${this.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
  }

  // Refresh token management
  setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.refreshTokenKey, token)
    }
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.refreshTokenKey)
  }

  // Permissions management
  setPermissions(permissions: Permissions): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.permissionsKey, JSON.stringify(permissions))
    }
  }

  getPermissions(): Permissions | null {
    if (typeof window === "undefined") return null
    const permissions = localStorage.getItem(this.permissionsKey)
    return permissions ? JSON.parse(permissions) : null
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("Login attempt with credentials:", credentials)

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || "Login failed")
      }

      const data = await response.json()
      console.log("API response:", data)

      if (data.accessToken) {
        console.log("Login successful, setting tokens")
        this.setToken(data.accessToken)
        this.setRefreshToken(data.refreshToken)

        // Backend returns user object in response
        // Extract permissions from user.role.permissions if available
        const permissions: Permissions = {}
        if (data.user?.role?.permissions) {
          // Convert permissions array to Permissions format if needed
          // For now, empty object means all permissions
        }
        this.setPermissions(permissions)

        return {
          success: true,
          token: data.accessToken,
          permissions: permissions
        }
      }

      console.log("Login failed, throwing error")
      throw new Error("Login failed")
    } catch (error) {
      console.error("Login error:", error)
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

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken()
      if (refreshToken) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
      // Try to fetch from API first
      const token = this.getToken()
      
      if (token) {
        const response = await fetch(`${BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          // Transform backend user format to frontend format
          return this.transformUserResponse(userData)
        } else if (response.status === 401) {
          // Token is invalid, clear it and throw error
          this.removeToken()
          throw new Error("Unauthorized: Please login again")
        }
      }

      // Fallback to JWT token if API call fails
      const user = this.getUserFromToken()
      if (!user) {
        throw new Error("No user found")
      }

      // JWT payload uses 'sub' for user ID (standard JWT claim)
      const userId = user.sub || user.id
      
      return {
        id: userId || 0,
        fullname: user.name || '',
        username: user.email || '',
        email: user.email || '',
        role: user.role || '',
        site_id: user.site_id || 0,
        org_id: null,
        clientId: 1,
        storeId: user.site_id || 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error("Failed to get current user:", error)
      throw error instanceof Error ? error : new Error("Failed to get current user")
    }
  }

  // Transform backend user response to frontend User format
  private transformUserResponse(userData: any): User {
    return {
      id: userData.id,
      fullname: userData.name || '',
      username: userData.email || '', // Use email as username if username not available
      email: userData.email || '',
      role: userData.role?.name || userData.role || '',
      site_id: userData.site_id || 0,
      org_id: userData.org_id || null,
      clientId: 1,
      storeId: userData.site_id || 0,
      status: 'active',
      created_at: userData.createdAt ? new Date(userData.createdAt).toISOString() : new Date().toISOString(),
      updated_at: userData.updatedAt ? new Date(userData.updatedAt).toISOString() : new Date().toISOString()
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiService.post("/change-password", data)
    if (!response.success) {
      throw new Error("Password change failed")
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await apiService.post("/forgot-password", data)
    if (!response.success) {
      throw new Error("Password reset request failed")
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiService.post("/reset-password", { token, newPassword })
    if (!response.success) {
      throw new Error("Password reset failed")
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = this.getToken()
    return token ? isTokenValid(token) : false
  }

  getUserFromToken(): JwtPayload | null {
    const token = this.getToken()
    return token ? extractUserFromToken(token) : null
  }

  hasPermission(module: string, action: string): boolean {
    const permissions = this.getPermissions()
    if (!permissions) return false
    
    // If permissions is empty object {}, user has all permissions (System Administrator)
    if (Object.keys(permissions).length === 0) {
      return true
    }
    
    const modulePermissions = permissions[module]
    if (!modulePermissions) return false
    
    // Handle both ModulePermissions (nested) and string[] (flat) structures
    if (Array.isArray(modulePermissions)) {
      return modulePermissions.includes(action) || modulePermissions.includes('*')
    }
    
    // If it's a ModulePermissions object, check all modules within it
    const actions = Object.values(modulePermissions).flat()
    return actions.includes(action) || actions.includes('*')
  }

  hasAllPermissions(module: string, actions: string[]): boolean {
    const permissions = this.getPermissions()
    if (!permissions) return false
    
    // If permissions is empty object {}, user has all permissions (System Administrator)
    if (Object.keys(permissions).length === 0) {
      return true
    }
    
    return actions.every(action => this.hasPermission(module, action))
  }
}

export const authService = new AuthService()
