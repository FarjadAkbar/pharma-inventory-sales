"use client"

import { BaseApiService } from "./base-api.service"

export class MasterDataApiService extends BaseApiService {
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
