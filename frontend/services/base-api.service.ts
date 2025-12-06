"use client"

import { authService } from "./auth.service"
import type { ApiResponse } from "@/types/auth"

export class BaseApiService {
  protected baseUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:4000/api/v1'

  protected getCurrentStoreId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("current_store_id")
  }

  // Generic request method with authentication
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = authService.getToken()
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
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : ({} as any)

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
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
    
    const token = authService.getToken()
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
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : ({} as any)

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
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
