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

class AuthService {
  private baseUrl = "/api/auth"
  private tokenKey = "pharma_inventory_sales_token"
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
      localStorage.removeItem(this.permissionsKey)
      // Also remove cookie
      document.cookie = `${this.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
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

    const response = await apiService.post<{ success: boolean; token: string; permissions?: Permissions; message?: string }>("/login", credentials)

    console.log("API response:", response)

    if (response.success && response.token) {
      console.log("Login successful, setting token and returning response")
      this.setToken(response.token)

      const permissions = response.permissions || {}
      this.setPermissions(permissions)

      return {
        success: true,
        token: response.token,
        permissions: permissions
      }
    }

    console.log("Login failed, throwing error")
    throw new Error(response.message || "Login failed")
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
      await apiService.post("/logout")
    } catch (error) {
      console.error("Logout request failed:", error)
    } finally {
      this.removeToken()
    }
  }

  async getCurrentUser(): Promise<User> {
    const user = this.getUserFromToken()
    if (!user) {
      throw new Error("No user found")
    }

    return {
      id: user.id.toString(),
      email: '', // Not in backend JWT payload
      name: '', // Not in backend JWT payload
      role: user.role,
      clientId: 1, // Default or derive from user.site_id if applicable
      storeId: user.site_id,
      permissions: this.getPermissions() || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    
    const modulePermissions = permissions[module]
    if (!modulePermissions) return false
    
    return modulePermissions.includes(action) || modulePermissions.includes('*')
  }

  hasAllPermissions(module: string, actions: string[]): boolean {
    return actions.every(action => this.hasPermission(module, action))
  }
}

export const authService = new AuthService()
