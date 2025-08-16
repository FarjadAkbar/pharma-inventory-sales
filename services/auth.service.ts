import type {
  User,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ForgotPasswordData,
  AuthResponse,
  ApiResponse,
} from "@/types/auth"

class AuthService {
  private baseUrl = "/api/auth"
  private tokenKey = "crm_token"

  // Token management
  setToken(token: string): void {
    // Set in localStorage for client-side access
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token)
    }
    // Set as httpOnly cookie for server-side access
    document.cookie = `${this.tokenKey}=${token}; path=/; max-age=${24 * 60 * 60}; samesite=strict`
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.tokenKey)
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey)
    }
    // Remove cookie
    document.cookie = `${this.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  // API request helper with token
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
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
    const response = await this.request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data) {
      this.setToken(response.data.token)
      return response.data
    }

    throw new Error(response.error || "Login failed")
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (response.success && response.data) {
      this.setToken(response.data.token)
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
    const response = await this.request<User>("/me")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || "Failed to get user data")
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
    return !!this.getToken()
  }
}

export const authService = new AuthService()
