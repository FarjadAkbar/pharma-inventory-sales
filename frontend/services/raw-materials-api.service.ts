"use client"

import { BaseApiService } from "./base-api.service"

export interface RawMaterial {
  id: number
  code: string
  name: string
  description?: string
  grade?: string
  storageRequirements?: string
  unit?: string
  supplierId: number
  supplier?: {
    id: number
    name: string
    contactPerson?: string
    email?: string
    phone?: string
  }
  status: 'Active' | 'InActive'
  createdAt: Date | string
  updatedAt: Date | string
}

export class RawMaterialsApiService extends BaseApiService {
  // Raw Materials API
  async getRawMaterials(params?: {
    search?: string
    page?: number
    limit?: number
    supplierId?: number
  }): Promise<RawMaterial[]> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.supplierId) searchParams.set("supplierId", params.supplierId.toString())

    const query = searchParams.toString()
    const response = await this.request(`/raw-materials${query ? `?${query}` : ""}`)
    // Backend returns array directly, not wrapped in ApiResponse
    return response
  }

  async getRawMaterial(id: string) {
    return this.request(`/raw-materials/${id}`)
  }

  async createRawMaterial(rawMaterialData: { 
    code: string
    name: string
    description?: string
    grade?: string
    storageRequirements?: string
    unit?: string
    supplierId: number
    status?: 'Active' | 'InActive'
  }) {
    return this.request("/raw-materials", {
      method: "POST",
      body: JSON.stringify(rawMaterialData),
    })
  }

  async updateRawMaterial(id: string, rawMaterialData: { 
    code?: string
    name?: string
    description?: string
    grade?: string
    storageRequirements?: string
    unit?: string
    supplierId?: number
    status?: 'Active' | 'InActive'
  }) {
    return this.request(`/raw-materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(rawMaterialData),
    })
  }

  async deleteRawMaterial(id: string) {
    return this.request(`/raw-materials/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for raw materials
  invalidateRawMaterials() {
    this.invalidateCache("raw-materials")
  }
}

export const rawMaterialsApiService = new RawMaterialsApiService()
