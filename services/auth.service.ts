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

class AuthService {
  private baseUrl = "/api/auth"
  private tokenKey = "pharma_inventory_sales_token"
  private permissionsKey = "pharma_inventory_sales_permissions"

  // Token management
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token)
    }
    document.cookie = `${this.tokenKey}=${token}; path=/; max-age=${24 * 60 * 60}; samesite=strict`
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.tokenKey)
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.permissionsKey)
    }
    document.cookie = `${this.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  // Store permissions from login response
  setPermissions(permissions: Permissions): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.permissionsKey, JSON.stringify(permissions))
    }
  }

  // Get permissions from storage
  getPermissions(): Permissions | null {
    if (typeof window === "undefined") return null
    
    const storedPermissions = localStorage.getItem(this.permissionsKey)
    if (storedPermissions) {
      try {
        return JSON.parse(storedPermissions)
      } catch (error) {
        console.error("Failed to parse stored permissions:", error)
        return null
      }
    }
    
    return null
  }

  // Get user info from token
  getUserFromToken(): JwtPayload | null {
    const token = this.getToken()
    if (!token) {
      console.log("No token found")
      return null
    }
    
    console.log("Token found, length:", token.length)
    console.log("Token first 50 chars:", token.substring(0, 50))
    console.log("Token found, extracting user data...")
    const userData = extractUserFromToken(token)
    console.log("Extracted user data:", userData)
    return userData
  }

  // API request helper with token
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("Login attempt with credentials:", credentials)
    
    const response = await this.request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }) as any

    console.log("API response:", response)

    if (response.success && response.token) {
      console.log("Login successful, setting token and returning response")
      this.setToken(response.token)
      this.setPermissions(response.permissions)
      return {
        success: true,
        token: response.token,
        permissions: response.permissions
      }
    }

    console.log("Login failed, throwing error")
    throw new Error(response.error || "Login failed")
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (response.success && response.data) {
      this.setToken(response.data.token)
      this.setPermissions(response.data.permissions)
      return response.data
    }

    throw new Error(response.error || "Registration failed")
  }

  async logout(): Promise<void> {
    try {
      await this.request("/logout", { method: "POST" })
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

    // Return user data extracted from token
    return {
      id: user.userId.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
      storeId: user.storeId,
      permissions: this.getPermissions() || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await this.request("/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (!response.success) {
      throw new Error(response.error || "Password change failed")
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await this.request("/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (!response.success) {
      throw new Error(response.error || "Password reset request failed")
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await this.request("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    })

    if (!response.success) {
      throw new Error(response.error || "Password reset failed")
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false
    
    // In browser, just check if token exists and decode to check expiration
    if (typeof window !== "undefined") {
      try {
        const decoded = extractUserFromToken(token)
        if (!decoded) return false
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000)
        return decoded.exp > currentTime
      } catch (error) {
        console.error("Token validation error in browser:", error)
        return false
      }
    }
    
    // In server environment, use full verification
    return isTokenValid(token)
  }

  // Check specific permission
  hasPermission(module: string, screen: string, action: 'view' | 'create' | 'update' | 'delete'): boolean {
    const permissions = this.getPermissions()
    console.log('🔐 AuthService hasPermission Debug:', {
      module,
      screen,
      action,
      permissions,
      modulePerms: permissions?.[module],
      screenPerms: permissions?.[module]?.[screen]
    })
    
    if (!permissions) return false
    
    const modulePerms = permissions[module]
    if (!modulePerms) return false
    
    const screenPerms = modulePerms[screen]
    if (!screenPerms) return false
    
    switch (action) {
      case 'view': return screenPerms.canView
      case 'create': return screenPerms.canCreate
      case 'update': return screenPerms.canUpdate
      case 'delete': return screenPerms.canDelete
      default: return false
    }
  }

  // Check if user has all permissions for a screen
  hasAllPermissions(module: string, screen: string): boolean {
    const permissions = this.getPermissions()
    if (!permissions) return false
    
    const modulePerms = permissions[module]
    if (!modulePerms) return false
    
    const screenPerms = modulePerms[screen]
    if (!screenPerms) return false
    
    return screenPerms.canAll
  }
}

export const authService = new AuthService()
