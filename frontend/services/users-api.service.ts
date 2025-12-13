"use client"

import { BaseApiService } from "./base-api.service"
import type { User } from "@/types/auth"

export class UsersApiService extends BaseApiService {
  // Transform backend user response to frontend User format
  private transformUserResponse(userData: any): User {
    return {
      id: userData.id,
      fullname: userData.name || '',
      username: userData.email || '', // Use email as username if username not available
      email: userData.email || '',
      role: userData.role?.name || userData.role || '',
      site_id: userData.site_id || 0,
      org_id: userData.org_id || null,
      clientId: 1,
      storeId: userData.site_id || 0,
      status: 'active',
      created_at: userData.createdAt ? new Date(userData.createdAt).toISOString() : new Date().toISOString(),
      updated_at: userData.updatedAt ? new Date(userData.updatedAt).toISOString() : new Date().toISOString()
    }
  }

  // Transform frontend user data to backend format
  private transformUserRequest(userData: any): any {
    // Handle roleId - can come from roleId, role.id, or role (if it's an object with id)
    let roleId: number | undefined
    if (userData.roleId) {
      roleId = typeof userData.roleId === 'number' ? userData.roleId : parseInt(userData.roleId)
    } else if (userData.role?.id) {
      roleId = typeof userData.role.id === 'number' ? userData.role.id : parseInt(userData.role.id)
    } else if (typeof userData.role === 'object' && userData.role.id) {
      roleId = typeof userData.role.id === 'number' ? userData.role.id : parseInt(userData.role.id)
    }

    // Handle siteIds - can come from siteIds, assignedStores (array of site IDs), or sites (array of site objects)
    let siteIds: number[] | undefined
    if (userData.siteIds && Array.isArray(userData.siteIds)) {
      siteIds = userData.siteIds.map((id: any) => typeof id === 'number' ? id : parseInt(id)).filter((id: number) => !isNaN(id))
    } else if (userData.assignedStores && Array.isArray(userData.assignedStores)) {
      siteIds = userData.assignedStores.map((id: any) => typeof id === 'number' ? id : parseInt(id)).filter((id: number) => !isNaN(id))
    } else if (userData.sites && Array.isArray(userData.sites)) {
      siteIds = userData.sites.map((site: any) => {
        const id = site.id || site
        return typeof id === 'number' ? id : parseInt(id)
      }).filter((id: number) => !isNaN(id))
    }

    const requestData: any = {
      name: userData.fullname || userData.name,
      email: userData.email,
    }

    // Only include password if provided (for updates, password is optional)
    if (userData.password) {
      requestData.password = userData.password
    }

    // Only include roleId if provided
    if (roleId) {
      requestData.roleId = roleId
    }

    // Only include siteIds if provided
    if (siteIds && siteIds.length > 0) {
      requestData.siteIds = siteIds
    }

    return requestData
  }

  // Users API (Direct backend calls)
  async getUsers(params?: {
    search?: string
    role?: string
    page?: number
    limit?: number
  }): Promise<{ users: User[]; pagination?: any }> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.role) searchParams.set("role", params.role)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    const response = await this.rawRequest<any>(`/users${query ? `?${query}` : ""}`)
    
    // Backend returns array directly or wrapped object
    const users = Array.isArray(response) ? response : (response.users || response.data || [])
    const transformedUsers = users.map((user: any) => this.transformUserResponse(user))
    
    return {
      users: transformedUsers,
      pagination: response.pagination || { page: params?.page || 1, total: transformedUsers.length, pages: 1 }
    }
  }

  async getCurrentUser(): Promise<User> {
    const userData = await this.rawRequest<any>("/users/me")
    return this.transformUserResponse(userData)
  }

  async getUserById(id: string): Promise<User> {
    const userData = await this.rawRequest<any>(`/users/${id}`)
    return this.transformUserResponse(userData)
  }

  async createUser(userData: any): Promise<User> {
    const transformedData = this.transformUserRequest(userData)
    const response = await this.rawRequest<any>("/users", {
      method: "POST",
      body: JSON.stringify(transformedData),
    })
    return this.transformUserResponse(response)
  }

  async updateUser(id: string, userData: any): Promise<User> {
    const transformedData = this.transformUserRequest(userData)
    const response = await this.rawRequest<any>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(transformedData),
    })
    return this.transformUserResponse(response)
  }

  async deleteUser(id: string): Promise<void> {
    await this.rawRequest(`/users/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for users
  invalidateUsers() {
    this.invalidateCache("users")
  }
}
