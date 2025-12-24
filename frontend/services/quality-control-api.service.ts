"use client"

import { BaseApiService } from "./base-api.service"

export class QualityControlApiService extends BaseApiService {
  // QC Tests API
  async getQCTests(params?: {
    materialId?: number
    search?: string
    category?: string
    isActive?: boolean
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.materialId) searchParams.set("materialId", params.materialId.toString())
    if (params?.search) searchParams.set("search", params.search)
    if (params?.category) searchParams.set("category", params.category)
    if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.rawRequest(`/qc-tests${query ? `?${query}` : ""}`)
  }

  async getQCTest(id: string) {
    return this.rawRequest(`/qc-tests/${id}`)
  }

  async createQCTest(testData: any) {
    return this.rawRequest("/qc-tests", {
      method: "POST",
      body: JSON.stringify(testData),
    })
  }

  async updateQCTest(id: string, testData: any) {
    return this.rawRequest(`/qc-tests/${id}`, {
      method: "PUT",
      body: JSON.stringify(testData),
    })
  }

  async deleteQCTest(id: string) {
    return this.rawRequest(`/qc-tests/${id}`, { method: "DELETE" })
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
    return this.rawRequest(`/qc-samples${query ? `?${query}` : ""}`)
  }

  async getQCSample(id: string) {
    return this.rawRequest(`/qc-samples/${id}`)
  }

  async getQCSampleByGoodsReceiptItem(goodsReceiptItemId: string) {
    return this.rawRequest(`/qc-samples/goods-receipt-item/${goodsReceiptItemId}`)
  }

  async createQCSample(sampleData: any) {
    return this.rawRequest("/qc-samples", {
      method: "POST",
      body: JSON.stringify(sampleData),
    })
  }

  async updateQCSample(id: string, sampleData: any) {
    return this.rawRequest(`/qc-samples/${id}`, {
      method: "PUT",
      body: JSON.stringify(sampleData),
    })
  }

  async receiveQCSample(id: string) {
    return this.rawRequest(`/qc-samples/${id}/receive`, {
      method: "POST",
    })
  }

  async assignTestsToSample(id: string, assignTestsDto: { testIds: number[] }) {
    return this.rawRequest(`/qc-samples/${id}/assign-tests`, {
      method: "POST",
      body: JSON.stringify(assignTestsDto),
    })
  }

  async deleteQCSample(id: string) {
    return this.rawRequest(`/qc-samples/${id}`, { method: "DELETE" })
  }

  // QC Results API
  async getQCResults(params?: {
    sampleId?: number
    search?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.sampleId) searchParams.set("sampleId", params.sampleId.toString())
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.rawRequest(`/qc-results${query ? `?${query}` : ""}`)
  }

  async getQCResult(id: string) {
    return this.rawRequest(`/qc-results/${id}`)
  }

  async createQCResult(resultData: any) {
    return this.rawRequest("/qc-results", {
      method: "POST",
      body: JSON.stringify(resultData),
    })
  }

  async updateQCResult(id: string, resultData: any) {
    return this.rawRequest(`/qc-results/${id}`, {
      method: "PUT",
      body: JSON.stringify(resultData),
    })
  }

  async submitResultsToQA(submitData: { resultIds: number[] }) {
    return this.rawRequest("/qc-results/submit-to-qa", {
      method: "POST",
      body: JSON.stringify(submitData),
    })
  }

  async completeTesting(sampleId: string) {
    return this.rawRequest(`/qc-results/complete-testing/${sampleId}`, {
      method: "POST",
    })
  }

  async deleteQCResult(id: string) {
    return this.rawRequest(`/qc-results/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for quality control data
  invalidateQCTests() {
    this.invalidateCache("qc-tests")
  }

  invalidateQCSamples() {
    this.invalidateCache("qc-samples")
  }

  invalidateQCResults() {
    this.invalidateCache("qc-results")
  }
}
