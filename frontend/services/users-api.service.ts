"use client"

import { BaseApiService } from "./base-api.service"
import type { User } from "@/types/auth"
import { authService } from "./auth.service"

export class UsersApiService extends BaseApiService {
  // ── Transforms ────────────────────────────────────────────────────────────

  private transformUserResponse(userData: any): User {
    const siteIds: number[] = userData.siteIds ?? []
    return {
      id:           userData.id,
      fullname:     userData.name  || "",
      username:     userData.email || "",
      email:        userData.email || "",
      role:         userData.role?.name || userData.role || "",
      site_id:      siteIds[0] ?? userData.site_id ?? 0,
      org_id:       userData.org_id || null,
      clientId:     1,
      storeId:      siteIds[0] ?? userData.site_id ?? 0,
      status:       "active",
      siteIds,
      isSiteScoped: userData.role?.isSiteScoped ?? false,
      created_at:   userData.createdAt ? new Date(userData.createdAt).toISOString() : new Date().toISOString(),
      updated_at:   userData.updatedAt ? new Date(userData.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private transformUserRequest(userData: any): any {
    // ── roleId ──
    let roleId: number | undefined
    if (userData.roleId) {
      roleId = typeof userData.roleId === "number" ? userData.roleId : parseInt(userData.roleId)
    } else if (userData.role?.id) {
      roleId = typeof userData.role.id === "number" ? userData.role.id : parseInt(userData.role.id)
    }

    // ── siteIds ──
    let siteIds: number[] | undefined
    if (userData.siteIds && Array.isArray(userData.siteIds)) {
      siteIds = userData.siteIds.map((id: any) => (typeof id === "number" ? id : parseInt(id))).filter((n: number) => !isNaN(n))
    } else if (userData.assignedStores && Array.isArray(userData.assignedStores)) {
      siteIds = userData.assignedStores.map((id: any) => (typeof id === "number" ? id : parseInt(id))).filter((n: number) => !isNaN(n))
    } else if (userData.sites && Array.isArray(userData.sites)) {
      siteIds = userData.sites.map((site: any) => {
        const id = site.id ?? site
        return typeof id === "number" ? id : parseInt(id)
      }).filter((n: number) => !isNaN(n))
    }

    const requestData: Record<string, unknown> = {
      name:  userData.fullname || userData.name,
      email: userData.email,
    }
    if (userData.password) requestData.password = userData.password
    if (roleId)            requestData.roleId  = roleId
    if (siteIds?.length)   requestData.siteIds = siteIds

    return requestData
  }

  // ── API methods ───────────────────────────────────────────────────────────

  /**
   * getUsers
   *
   * Site-scoped roles (Site Manager, Cashier, …) automatically receive the
   * API Gateway's site-filtered response because the gateway reads their
   * `siteIds` from the JWT.
   *
   * However, as an extra client-side safety net, we also append siteIds to
   * the query for explicit clarity and future-proofing against gateways that
   * don't filter at the transport layer.
   */
  async getUsers(params?: {
    search?: string
    role?: string
    page?: number
    limit?: number
    /** Explicit site filter (overrides the site-context default) */
    siteId?: number
    siteIds?: number[]
  }): Promise<{ users: User[]; pagination?: any }> {
    const qs = new URLSearchParams()
    if (params?.search)  qs.set("search", params.search)
    if (params?.role)    qs.set("role",   params.role)
    if (params?.page)    qs.set("page",   params.page.toString())
    if (params?.limit)   qs.set("limit",  params.limit.toString())
    if (params?.siteId)  qs.set("siteId", params.siteId.toString())

    // Merge caller-supplied siteIds with auto-context
    const callerSiteIds = params?.siteIds ?? []
    const contextIds    = authService.isSiteScoped() ? authService.getUserSiteIds() : []
    const merged        = [...new Set([...callerSiteIds, ...contextIds])]
    merged.forEach(id => qs.append("siteIds", String(id)))

    const response = await this.rawRequest<any>(`/users${qs.toString() ? `?${qs.toString()}` : ""}`)

    const rawUsers = Array.isArray(response) ? response : (response.users || response.data || [])
    const users    = rawUsers.map((u: any) => this.transformUserResponse(u))

    return {
      users,
      pagination: response.pagination || { page: params?.page ?? 1, total: users.length, pages: 1 },
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
    const payload  = this.transformUserRequest(userData)
    const response = await this.rawRequest<any>("/users", {
      method: "POST",
      body:   JSON.stringify(payload),
    })
    return this.transformUserResponse(response)
  }

  async updateUser(id: string, userData: any): Promise<User> {
    const payload  = this.transformUserRequest(userData)
    const response = await this.rawRequest<any>(`/users/${id}`, {
      method: "PUT",
      body:   JSON.stringify(payload),
    })
    return this.transformUserResponse(response)
  }

  async deleteUser(id: string): Promise<void> {
    await this.rawRequest(`/users/${id}`, { method: "DELETE" })
  }

  /**
   * shiftSite — reassign an employee to different site(s).
   * Only available to system-wide roles (Admin, etc.).
   * The API Gateway will reject this call if the requester is site-scoped.
   */
  async shiftSite(userId: string, newSiteIds: number[]): Promise<User> {
    const response = await this.rawRequest<any>(`/users/${userId}/shift-site`, {
      method: "PUT",
      body:   JSON.stringify({ siteIds: newSiteIds }),
    })
    return this.transformUserResponse(response)
  }

  // ── Cache helpers ─────────────────────────────────────────────────────────

  invalidateUsers(): void {
    this.invalidateCache("users")
  }
}
