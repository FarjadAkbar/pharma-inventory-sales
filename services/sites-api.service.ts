"use client"

import { BaseApiService } from "./base-api.service"
import type { SitesResponse, SiteResponse, SiteActionResponse } from "@/types/sites"

export class SitesApiService extends BaseApiService {
  // Sites API
  async getSites(): Promise<SitesResponse> {
    console.log("API getSites called at:", new Date().toISOString())
    return this.sitesRequest<SitesResponse>("/site/getAllSites")
  }

  async getSite(id: number): Promise<SiteResponse> {
    return this.sitesRequest<SiteResponse>(`/site/${id}`)
  }

  async createSite(data: { name: string; location: string }): Promise<SiteActionResponse> {
    return this.sitesRequest<SiteActionResponse>("/site", {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  async updateSite(id: number, data: { name: string; location: string }): Promise<SiteActionResponse> {
    return this.sitesRequest<SiteActionResponse>(`/site/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
  }

  async deleteSite(id: number): Promise<SiteActionResponse> {
    return this.sitesRequest<SiteActionResponse>(`/site/${id}`, {
      method: "DELETE"
    })
  }

  // Cache invalidation for sites
  invalidateSites() {
    this.invalidateCache("sites")
  }
}
