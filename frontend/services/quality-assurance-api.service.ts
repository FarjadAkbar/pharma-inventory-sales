"use client"

import { BaseApiService } from "./base-api.service"

export class QualityAssuranceApiService extends BaseApiService {
  // QA Releases API
  async getQAReleases(params?: {
    sampleId?: number
    search?: string
    entityType?: string
    status?: string
    priority?: string
    reviewedBy?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.sampleId) searchParams.set("sampleId", params.sampleId.toString())
    if (params?.search) searchParams.set("search", params.search)
    if (params?.entityType) searchParams.set("entityType", params.entityType)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.reviewedBy) searchParams.set("reviewedBy", params.reviewedBy)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.rawRequest(`/qa-releases${query ? `?${query}` : ""}`)
  }

  async getQARelease(id: string) {
    return this.rawRequest(`/qa-releases/${id}`)
  }

  async createQARelease(releaseData: any) {
    return this.rawRequest("/qa-releases", {
      method: "POST",
      body: JSON.stringify(releaseData),
    })
  }

  async updateQARelease(id: string, releaseData: any) {
    return this.rawRequest(`/qa-releases/${id}`, {
      method: "PUT",
      body: JSON.stringify(releaseData),
    })
  }

  async completeChecklist(id: string, reviewedBy: number) {
    return this.rawRequest(`/qa-releases/${id}/complete-checklist`, {
      method: "POST",
      body: JSON.stringify({ reviewedBy }),
    })
  }

  async makeDecision(id: string, decisionData: any) {
    return this.rawRequest(`/qa-releases/${id}/make-decision`, {
      method: "POST",
      body: JSON.stringify(decisionData),
    })
  }

  async notifyWarehouse(id: string) {
    return this.rawRequest(`/qa-releases/${id}/notify-warehouse`, {
      method: "POST",
    })
  }

  async deleteQARelease(id: string) {
    return this.rawRequest(`/qa-releases/${id}`, { method: "DELETE" })
  }

  // QA Deviations API
  async getQADeviations(params?: {
    search?: string
    severity?: string
    category?: string
    status?: string
    assignedTo?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.severity) searchParams.set("severity", params.severity)
    if (params?.category) searchParams.set("category", params.category)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/quality-assurance/deviations${query ? `?${query}` : ""}`)
  }

  async getQADeviation(id: string) {
    return this.request(`/quality-assurance/deviations/${id}`)
  }

  async createQADeviation(deviationData: any) {
    return this.request("/quality-assurance/deviations", {
      method: "POST",
      body: JSON.stringify(deviationData),
    })
  }

  async updateQADeviation(deviationData: any) {
    return this.request("/quality-assurance/deviations", {
      method: "PUT",
      body: JSON.stringify(deviationData),
    })
  }

  async deleteQADeviation(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/quality-assurance/deviations?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for quality assurance data
  invalidateQAReleases() {
    this.invalidateCache("qa-releases")
  }

  invalidateQADeviations() {
    this.invalidateCache("qa-deviations")
  }
}
