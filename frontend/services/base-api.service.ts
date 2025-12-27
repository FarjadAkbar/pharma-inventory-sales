"use client"

import { authService } from "./auth.service"
import type { ApiResponse } from "@/types/auth"
import { BASE_URL } from "@/config"
import { isTokenValid, decodeToken } from "@/lib/jwt"

export class BaseApiService {
  protected baseUrl = BASE_URL
  private isRefreshing = false
  private refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null

  protected getCurrentStoreId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("current_store_id")
  }

  // Check if token is about to expire (within 2 minutes)
  private isTokenExpiringSoon(token: string | null): boolean {
    if (!token) return true
    
    try {
      const decoded = decodeToken(token)
      if (!decoded || !decoded.exp) return true
      
      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = decoded.exp - currentTime
      
      // Refresh if token expires in less than 2 minutes
      return timeUntilExpiry < 120
    } catch {
      return true
    }
  }

  // Ensure token is valid, refresh if needed
  private async ensureValidToken(): Promise<string | null> {
    const token = authService.getToken()
    
    // If no token, return null
    if (!token) return null
    
    // If token is valid and not expiring soon, return it
    if (isTokenValid(token) && !this.isTokenExpiringSoon(token)) {
      return token
    }
    
    // If already refreshing, wait for that promise
    if (this.isRefreshing && this.refreshPromise) {
      const result = await this.refreshPromise
      return result?.accessToken || null
    }
    
    // Start refresh process
    this.isRefreshing = true
    this.refreshPromise = authService.refreshToken()
    
    try {
      const result = await this.refreshPromise
      return result?.accessToken || null
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  // Generic request method with authentication
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Ensure token is valid before making request
    const token = await this.ensureValidToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const storeId = this.getCurrentStoreId()
    if (storeId) {
      headers["x-store-id"] = storeId
    }

    try {
      window.dispatchEvent(new Event("api:request:start"))
      let response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      // If 401, try to refresh token and retry once
      if (response.status === 401 && token) {
        const refreshResult = await authService.refreshToken()
        if (refreshResult?.accessToken) {
          headers["Authorization"] = `Bearer ${refreshResult.accessToken}`
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
          })
        } else {
          // Refresh failed, redirect to login
          authService.removeToken()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
          throw new Error("Session expired. Please login again.")
        }
      }

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : ({} as any)

      if (!response.ok) {
        // Handle NestJS error response format: { message: string | string[], statusCode: number }
        const errorMessage = Array.isArray(data.message) 
          ? data.message.join(', ') 
          : data.message || data.error || "Request failed"
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    } finally {
      window.dispatchEvent(new Event("api:request:stop"))
    }
  }

  // Raw request method that returns the response directly (for APIs that don't wrap responses)
  protected async rawRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log(`HTTP ${options.method || 'GET'} request to: ${this.baseUrl}${endpoint} at:`, new Date().toISOString())
    
    // Ensure token is valid before making request
    const token = await this.ensureValidToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const storeId = this.getCurrentStoreId()
    if (storeId) {
      headers["x-store-id"] = storeId
    }

    try {
      window.dispatchEvent(new Event("api:request:start"))
      let response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      // If 401, try to refresh token and retry once
      if (response.status === 401 && token) {
        const refreshResult = await authService.refreshToken()
        if (refreshResult?.accessToken) {
          headers["Authorization"] = `Bearer ${refreshResult.accessToken}`
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
          })
        } else {
          // Refresh failed, redirect to login
          authService.removeToken()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
          throw new Error("Session expired. Please login again.")
        }
      }

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : ({} as any)

      if (!response.ok) {
        // Handle NestJS error response format: { message: string | string[], statusCode: number }
        const errorMessage = Array.isArray(data.message) 
          ? data.message.join(', ') 
          : data.message || data.error || "Request failed"
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    } finally {
      window.dispatchEvent(new Event("api:request:stop"))
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { method: 'GET' })
  }
  
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }
  
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }
  
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { method: 'DELETE' })
  }
  
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }

  // Cache invalidation methods
  invalidateCache(key: string) {
    // In a real app, this would work with a caching layer like React Query
    console.log(`Invalidating cache for: ${key}`)
  }
}
