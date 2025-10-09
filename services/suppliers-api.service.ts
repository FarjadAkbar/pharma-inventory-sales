"use client"

import { BaseApiService } from "./base-api.service"
import type { SupplierApiResponse, CreateSupplierData, UpdateSupplierData } from "@/types/suppliers"

export class SuppliersApiService extends BaseApiService {
  // Suppliers API
  async getSuppliers(): Promise<SupplierApiResponse> {
    console.log("API getSuppliers called at:", new Date().toISOString())
    return this.rawRequest<SupplierApiResponse>("/supplier/getAllSupplier")
  }

  async getSupplier(id: number): Promise<SupplierApiResponse> {
    return this.rawRequest<SupplierApiResponse>(`/supplier/${id}`)
  }

  async getSupplierBySite(supplierId: number, siteId: number): Promise<SupplierApiResponse> {
    return this.rawRequest<SupplierApiResponse>(`/supplier/${supplierId}/site/${siteId}`)
  }

  async createSupplier(data: CreateSupplierData): Promise<SupplierApiResponse> {
    return this.rawRequest<SupplierApiResponse>("/supplier", {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  async updateSupplier(id: number, data: UpdateSupplierData): Promise<SupplierApiResponse> {
    return this.rawRequest<SupplierApiResponse>(`/supplier/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
  }

  async deleteSupplier(id: number): Promise<SupplierApiResponse> {
    return this.rawRequest<SupplierApiResponse>(`/supplier/${id}`, {
      method: "DELETE"
    })
  }

  // Cache invalidation for suppliers
  invalidateSuppliers() {
    this.invalidateCache("suppliers")
  }
}
