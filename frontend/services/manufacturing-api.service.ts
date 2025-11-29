"use client"

import { BaseApiService } from "./base-api.service"

export class ManufacturingApiService extends BaseApiService {
  // BOMs API
  async getBOMs(params?: {
    search?: string
    drugId?: string
    status?: string
    version?: number
    createdBy?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.drugId) searchParams.set("drugId", params.drugId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.version) searchParams.set("version", params.version.toString())
    if (params?.createdBy) searchParams.set("createdBy", params.createdBy)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/manufacturing/boms${query ? `?${query}` : ""}`)
  }

  async createBOM(bomData: any) {
    return this.request("/manufacturing/boms", {
      method: "POST",
      body: JSON.stringify(bomData),
    })
  }

  async updateBOM(bomData: any) {
    return this.request("/manufacturing/boms", {
      method: "PUT",
      body: JSON.stringify(bomData),
    })
  }

  async deleteBOM(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/manufacturing/boms?${sp.toString()}`, { method: "DELETE" })
  }

  // Work Orders API
  async getWorkOrders(params?: {
    search?: string
    drugId?: string
    siteId?: string
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
    if (params?.drugId) searchParams.set("drugId", params.drugId)
    if (params?.siteId) searchParams.set("siteId", params.siteId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/manufacturing/work-orders${query ? `?${query}` : ""}`)
  }

  async createWorkOrder(workOrderData: any) {
    return this.request("/manufacturing/work-orders", {
      method: "POST",
      body: JSON.stringify(workOrderData),
    })
  }

  async updateWorkOrder(workOrderData: any) {
    return this.request("/manufacturing/work-orders", {
      method: "PUT",
      body: JSON.stringify(workOrderData),
    })
  }

  async deleteWorkOrder(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/manufacturing/work-orders?${sp.toString()}`, { method: "DELETE" })
  }

  // Batches API
  async getBatches(params?: {
    search?: string
    drugId?: string
    siteId?: string
    status?: string
    priority?: string
    createdBy?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.drugId) searchParams.set("drugId", params.drugId)
    if (params?.siteId) searchParams.set("siteId", params.siteId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.createdBy) searchParams.set("createdBy", params.createdBy)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/manufacturing/batches${query ? `?${query}` : ""}`)
  }

  async createBatch(batchData: any) {
    return this.request("/manufacturing/batches", {
      method: "POST",
      body: JSON.stringify(batchData),
    })
  }

  async updateBatch(batchData: any) {
    return this.request("/manufacturing/batches", {
      method: "PUT",
      body: JSON.stringify(batchData),
    })
  }

  async deleteBatch(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/manufacturing/batches?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for manufacturing data
  invalidateBOMs() {
    this.invalidateCache("boms")
  }

  invalidateWorkOrders() {
    this.invalidateCache("work-orders")
  }

  invalidateBatches() {
    this.invalidateCache("batches")
  }
}
