"use client"

import { BaseApiService } from "./base-api.service"

export interface Site {
  id: number
  name: string
  address?: string
  city?: string
  country?: string
  type?: 'hospital' | 'clinic' | 'pharmacy' | 'warehouse' | 'manufacturing'
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export class SitesApiService extends BaseApiService {
  // Sites API
  async getSites(params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<any> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    const response = await this.request(`/sites${query ? `?${query}` : ""}`)
    // Backend returns array directly, not wrapped in ApiResponse
    return response
  }

  async getSite(id: string) {
    return this.request(`/sites/${id}`)
  }

  async createSite(siteData: { 
    name: string
    address?: string
    city?: string
    country?: string
    type?: string
    isActive?: boolean
  }) {
    return this.request("/sites", {
      method: "POST",
      body: JSON.stringify(siteData),
    })
  }

  async updateSite(id: string, siteData: { 
    name?: string
    address?: string
    city?: string
    country?: string
    type?: string
    isActive?: boolean
  }) {
    return this.request(`/sites/${id}`, {
      method: "PUT",
      body: JSON.stringify(siteData),
    })
  }

  async deleteSite(id: string) {
    return this.request(`/sites/${id}`, { method: "DELETE" })
  }

  async getSiteTypes(): Promise<string[]> {
    return this.request<string[]>("/sites/types/metadata")
  }

  // Cache invalidation for sites
  invalidateSites() {
    this.invalidateCache("sites")
  }
}

export const sitesApiService = new SitesApiService()
