"use client"

import { authService } from "./auth.service"
import type { ApiResponse } from "@/types/auth"

class ApiService {
  private baseUrl = "/api"
  private getCurrentStoreId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("current_store_id")
  }

  // Generic request method with authentication
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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
    }
    finally {
      window.dispatchEvent(new Event("api:request:stop"))
    }
  }

  // Products API
  async getProducts(params?: {
    search?: string
    category?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.category) searchParams.set("category", params.category)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/products${query ? `?${query}` : ""}`)
  }

  // Stores API
  async getStores() {
    return this.request(`/stores`)
  }
  async createStore(payload: any) {
    return this.request(`/stores`, { method: "POST", body: JSON.stringify(payload) })
  }
  async updateStore(id: string, payload: any) {
    return this.request(`/stores/${id}`, { method: "PUT", body: JSON.stringify(payload) })
  }
  async deleteStore(id: string) {
    return this.request(`/stores/${id}`, { method: "DELETE" })
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`)
  }

  async createProduct(productData: any) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    })
  }

  // Vendors API
  async getVendors(params?: {
    search?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/vendors${query ? `?${query}` : ""}`)
  }

  async createVendor(vendorData: any) {
    return this.request("/vendors", {
      method: "POST",
      body: JSON.stringify(vendorData),
    })
  }

  // Users API (Admin only)
  async getUsers(params?: {
    search?: string
    role?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.role) searchParams.set("role", params.role)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/users${query ? `?${query}` : ""}`)
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userData: any) {
    return this.request("/users", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/users?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation methods
  invalidateCache(key: string) {
    // In a real app, this would work with a caching layer like React Query
    console.log(`Invalidating cache for: ${key}`)
  }

  invalidateProducts() {
    this.invalidateCache("products")
  }

  invalidateVendors() {
    this.invalidateCache("vendors")
  }

  invalidateUsers() {
    this.invalidateCache("users")
  }
}

export const apiService = new ApiService()
