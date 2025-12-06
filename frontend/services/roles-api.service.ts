"use client"

import { BaseApiService } from "./base-api.service"

export class RolesApiService extends BaseApiService {
  // Roles API
  async getRoles(params?: {
    search?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/roles${query ? `?${query}` : ""}`)
  }

  async getRole(id: string) {
    return this.request(`/roles/${id}`)
  }

  async createRole(roleData: { name: string }) {
    return this.request("/roles", {
      method: "POST",
      body: JSON.stringify(roleData),
    })
  }

  async updateRole(id: string, roleData: { name: string }) {
    return this.request(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(roleData),
    })
  }

  async deleteRole(id: string) {
    return this.request(`/roles/${id}`, { method: "DELETE" })
  }

  async addPermissionToRole(roleId: string, permissionId: string) {
    return this.request(`/roles/add-permissions/${roleId}`, {
      method: "PUT",
      body: JSON.stringify({ permissionId }),
    })
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.request(`/roles/remove-permissions/${roleId}`, {
      method: "PUT",
      body: JSON.stringify({ permissionId }),
    })
  }

  // Cache invalidation for roles
  invalidateRoles() {
    this.invalidateCache("roles")
  }
}

export const rolesApiService = new RolesApiService()
