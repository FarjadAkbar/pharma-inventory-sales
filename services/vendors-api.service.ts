"use client"

import { BaseApiService } from "./base-api.service"

export class VendorsApiService extends BaseApiService {
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

  // Cache invalidation for vendors
  invalidateVendors() {
    this.invalidateCache("vendors")
  }
}
