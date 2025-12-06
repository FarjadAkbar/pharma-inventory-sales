"use client"

import { BaseApiService } from "./base-api.service"

export class UsersApiService extends BaseApiService {
  // Users API (Direct backend calls)
  async getUsers(params?: {
    search?: string
    role?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.role) searchParams.set("role", params.role)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/users${query ? `?${query}` : ""}`)
  }

  async getCurrentUser() {
    return this.request("/users/me")
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for users
  invalidateUsers() {
    this.invalidateCache("users")
  }
}
