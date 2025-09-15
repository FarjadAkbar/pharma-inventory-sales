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

  // Pharmaceutical Master Data API
  // Drugs API
  async getDrugs(params?: {
    search?: string
    dosageForm?: string
    route?: string
    approvalStatus?: string
    therapeuticClass?: string
    manufacturer?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.dosageForm) searchParams.set("dosageForm", params.dosageForm)
    if (params?.route) searchParams.set("route", params.route)
    if (params?.approvalStatus) searchParams.set("approvalStatus", params.approvalStatus)
    if (params?.therapeuticClass) searchParams.set("therapeuticClass", params.therapeuticClass)
    if (params?.manufacturer) searchParams.set("manufacturer", params.manufacturer)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/master-data/drugs${query ? `?${query}` : ""}`)
  }

  async createDrug(drugData: any) {
    return this.request("/master-data/drugs", {
      method: "POST",
      body: JSON.stringify(drugData),
    })
  }

  async updateDrug(drugData: any) {
    return this.request("/master-data/drugs", {
      method: "PUT",
      body: JSON.stringify(drugData),
    })
  }

  async deleteDrug(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/master-data/drugs?${sp.toString()}`, { method: "DELETE" })
  }

  // Raw Materials API
  async getRawMaterials(params?: {
    search?: string
    grade?: string
    supplierId?: string
    isActive?: boolean
    lowStock?: boolean
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.grade) searchParams.set("grade", params.grade)
    if (params?.supplierId) searchParams.set("supplierId", params.supplierId)
    if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())
    if (params?.lowStock) searchParams.set("lowStock", params.lowStock.toString())
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/master-data/raw-materials${query ? `?${query}` : ""}`)
  }

  async createRawMaterial(materialData: any) {
    return this.request("/master-data/raw-materials", {
      method: "POST",
      body: JSON.stringify(materialData),
    })
  }

  async updateRawMaterial(materialData: any) {
    return this.request("/master-data/raw-materials", {
      method: "PUT",
      body: JSON.stringify(materialData),
    })
  }

  async deleteRawMaterial(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/master-data/raw-materials?${sp.toString()}`, { method: "DELETE" })
  }

  // Suppliers API
  async getSuppliers(params?: {
    search?: string
    rating?: number
    isActive?: boolean
    performance?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.rating) searchParams.set("rating", params.rating.toString())
    if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())
    if (params?.performance) searchParams.set("performance", params.performance)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/master-data/suppliers${query ? `?${query}` : ""}`)
  }

  async createSupplier(supplierData: any) {
    return this.request("/master-data/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierData),
    })
  }

  async updateSupplier(supplierData: any) {
    return this.request("/master-data/suppliers", {
      method: "PUT",
      body: JSON.stringify(supplierData),
    })
  }

  async deleteSupplier(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/master-data/suppliers?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for pharmaceutical data
  invalidateDrugs() {
    this.invalidateCache("drugs")
  }

  invalidateRawMaterials() {
    this.invalidateCache("raw-materials")
  }

  invalidateSuppliers() {
    this.invalidateCache("suppliers")
  }
}

export const apiService = new ApiService()
