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
    return this.request(`/manufacturing/boms/${id}`, { method: "DELETE" })
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

  async getWorkOrder(id: string) {
    return this.request(`/manufacturing/work-orders/${id}`)
  }

  async createWorkOrder(workOrderData: any) {
    return this.request("/manufacturing/work-orders", {
      method: "POST",
      body: JSON.stringify(workOrderData),
    })
  }

  async updateWorkOrder(id: string, workOrderData: any) {
    return this.request(`/manufacturing/work-orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(workOrderData),
    })
  }

  async deleteWorkOrder(id: string) {
    return this.request(`/manufacturing/work-orders/${id}`, { method: "DELETE" })
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

  async getBatch(id: string) {
    return this.request(`/manufacturing/batches/${id}`)
  }

  async createBatch(batchData: any) {
    return this.request("/manufacturing/batches", {
      method: "POST",
      body: JSON.stringify(batchData),
    })
  }

  async startBatch(id: string, startData: any) {
    return this.request(`/manufacturing/batches/${id}/start`, {
      method: "POST",
      body: JSON.stringify(startData),
    })
  }

  async consumeMaterial(batchId: string, consumeData: any) {
    return this.request(`/manufacturing/batches/${batchId}/consume-material`, {
      method: "POST",
      body: JSON.stringify(consumeData),
    })
  }

  async executeBatchStep(batchId: string, stepData: any) {
    return this.request(`/manufacturing/batches/${batchId}/execute-step`, {
      method: "POST",
      body: JSON.stringify(stepData),
    })
  }

  async completeBatch(id: string, completeData: any) {
    return this.request(`/manufacturing/batches/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(completeData),
    })
  }

  async submitBatchToQC(id: string, submitData: any) {
    return this.request(`/manufacturing/batches/${id}/submit-to-qc`, {
      method: "POST",
      body: JSON.stringify(submitData),
    })
  }

  async receiveFinishedGoods(id: string, receiveData: any) {
    return this.request(`/manufacturing/batches/${id}/receive-finished-goods`, {
      method: "POST",
      body: JSON.stringify(receiveData),
    })
  }

  async getBatchSteps(batchId: string) {
    return this.request(`/manufacturing/batches/${batchId}/steps`)
  }

  async getMaterialConsumption(batchId: string) {
    return this.request(`/manufacturing/batches/${batchId}/material-consumption`)
  }

  async getMaterialConsumptions(params?: {
    batchId?: string
    materialId?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.batchId) searchParams.set("batchId", params.batchId)
    if (params?.materialId) searchParams.set("materialId", params.materialId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/manufacturing/material-consumption${query ? `?${query}` : ""}`)
  }

  async getMaterialConsumptionById(id: string) {
    return this.request(`/manufacturing/material-consumption/${id}`)
  }

  async createMaterialConsumption(batchId: string, consumeData: any) {
    return this.request(`/manufacturing/batches/${batchId}/consume-material`, {
      method: "POST",
      body: JSON.stringify(consumeData),
    })
  }

  async updateMaterialConsumption(id: string, updateData: any) {
    return this.request(`/manufacturing/material-consumption/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  }

  async deleteMaterialConsumption(id: string) {
    return this.request(`/manufacturing/material-consumption/${id}`, {
      method: "DELETE",
    })
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

  // EBR API
  async getEBRs(params?: {
    batchId?: string
    drugId?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.batchId) searchParams.set("batchId", params.batchId)
    if (params?.drugId) searchParams.set("drugId", params.drugId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/manufacturing/ebr${query ? `?${query}` : ""}`)
  }

  async getEBRByBatch(batchId: string) {
    return this.request(`/manufacturing/ebr/${batchId}`)
  }
}
