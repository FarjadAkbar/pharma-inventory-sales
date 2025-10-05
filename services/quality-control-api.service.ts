"use client"

import { BaseApiService } from "./base-api.service"

export class QualityControlApiService extends BaseApiService {
  // QC Tests API
  async getQCTests(params?: {
    search?: string
    category?: string
    isActive?: boolean
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.category) searchParams.set("category", params.category)
    if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/quality-control/qc-tests${query ? `?${query}` : ""}`)
  }

  async createQCTest(testData: any) {
    return this.request("/quality-control/qc-tests", {
      method: "POST",
      body: JSON.stringify(testData),
    })
  }

  async updateQCTest(testData: any) {
    return this.request("/quality-control/qc-tests", {
      method: "PUT",
      body: JSON.stringify(testData),
    })
  }

  async deleteQCTest(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/quality-control/qc-tests?${sp.toString()}`, { method: "DELETE" })
  }

  // QC Samples API
  async getQCSamples(params?: {
    search?: string
    sourceType?: string
    status?: string
    priority?: string
    assignedTo?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.sourceType) searchParams.set("sourceType", params.sourceType)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/quality-control/qc-samples${query ? `?${query}` : ""}`)
  }

  async getQCSample(id: string) {
    return this.request(`/quality-control/qc-samples/${id}`)
  }

  async createQCSample(sampleData: any) {
    return this.request("/quality-control/qc-samples", {
      method: "POST",
      body: JSON.stringify(sampleData),
    })
  }

  async updateQCSample(sampleData: any) {
    return this.request("/quality-control/qc-samples", {
      method: "PUT",
      body: JSON.stringify(sampleData),
    })
  }

  async updateQCSampleResults(id: string, resultsData: any) {
    return this.request(`/quality-control/qc-samples/${id}/results`, {
      method: "PUT",
      body: JSON.stringify(resultsData),
    })
  }

  async deleteQCSample(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/quality-control/qc-samples?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for quality control data
  invalidateQCTests() {
    this.invalidateCache("qc-tests")
  }

  invalidateQCSamples() {
    this.invalidateCache("qc-samples")
  }
}
