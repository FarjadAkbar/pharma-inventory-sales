"use client"

import { BaseApiService } from "./base-api.service"

export interface Supplier {
  id: number
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  rating: number
  status: 'Active' | 'Inactive'
  siteIds?: number[]
  sites?: Array<{ id: number; name: string; address?: string; city?: string; type?: string }>
  createdAt: Date | string
  updatedAt: Date | string
}

export class SuppliersApiService extends BaseApiService {
  // Suppliers API
  async getSuppliers(params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<Supplier[]> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    const response = await this.request(`/suppliers${query ? `?${query}` : ""}`)
    // Backend returns array directly, not wrapped in ApiResponse
    return response
  }

  async getSupplier(id: string) {
    return this.request(`/suppliers/${id}`)
  }

  async createSupplier(supplierData: { 
    name: string
    contactPerson: string
    email: string
    phone: string
    address: string
    rating?: number
    status?: 'Active' | 'Inactive'
    siteIds?: number[]
  }) {
    return this.request("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierData),
    })
  }

  async updateSupplier(id: string, supplierData: { 
    name?: string
    contactPerson?: string
    email?: string
    phone?: string
    address?: string
    rating?: number
    status?: 'Active' | 'Inactive'
    siteIds?: number[]
  }) {
    return this.request(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplierData),
    })
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for suppliers
  invalidateSuppliers() {
    this.invalidateCache("suppliers")
  }
}

export const suppliersApiService = new SuppliersApiService()
