"use client"

import { BaseApiService } from "./base-api.service"

export class PermissionsApiService extends BaseApiService {
  // Permissions API
  async getPermissions(params?: {
    search?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/permissions${query ? `?${query}` : ""}`)
  }

  async getPermission(id: string) {
    return this.request(`/permissions/${id}`)
  }

  async createPermission(permissionData: { name: string }) {
    return this.request("/permissions", {
      method: "POST",
      body: JSON.stringify(permissionData),
    })
  }

  async updatePermission(id: string, permissionData: { name: string }) {
    return this.request(`/permissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(permissionData),
    })
  }

  async deletePermission(id: string) {
    return this.request(`/permissions/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for permissions
  invalidatePermissions() {
    this.invalidateCache("permissions")
  }
}

export const permissionsApiService = new PermissionsApiService()
