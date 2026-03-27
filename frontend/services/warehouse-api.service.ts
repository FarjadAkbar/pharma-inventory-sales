"use client"

import { BaseApiService } from "./base-api.service"

export class WarehouseApiService extends BaseApiService {
  // Inventory API
  async getInventoryItems(params?: {
    search?: string
    materialId?: string
    status?: string
    zone?: string
    location?: string
    expiryDateFrom?: string
    expiryDateTo?: string
    temperatureMin?: number
    temperatureMax?: number
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.materialId) searchParams.set("materialId", params.materialId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.zone) searchParams.set("zone", params.zone)
    if (params?.location) searchParams.set("location", params.location)
    if (params?.expiryDateFrom) searchParams.set("expiryDateFrom", params.expiryDateFrom)
    if (params?.expiryDateTo) searchParams.set("expiryDateTo", params.expiryDateTo)
    if (params?.temperatureMin) searchParams.set("temperatureMin", params.temperatureMin.toString())
    if (params?.temperatureMax) searchParams.set("temperatureMax", params.temperatureMax.toString())
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/warehouse/inventory${query ? `?${query}` : ""}`)
  }

  async createInventoryItem(itemData: any) {
    return this.request("/warehouse/inventory", {
      method: "POST",
      body: JSON.stringify(itemData),
    })
  }

  async updateInventoryItem(itemData: any) {
    return this.request("/warehouse/inventory", {
      method: "PUT",
      body: JSON.stringify(itemData),
    })
  }

  async deleteInventoryItem(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/warehouse/inventory?${sp.toString()}`, { method: "DELETE" })
  }

  // Putaway Tasks API
  async getPutawayTasks(params?: {
    search?: string
    status?: string
    priority?: string
    assignedTo?: string
    zone?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.zone) searchParams.set("zone", params.zone)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/warehouse/putaway${query ? `?${query}` : ""}`)
  }

  async createPutawayTask(taskData: any) {
    return this.request("/warehouse/putaway", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  async assignPutawayLocation(
    putawayId: number,
    assignDto: {
      locationId: string
      zone?: string
      rack?: string
      shelf?: string
      position?: string
      remarks?: string
      assignedBy: number
    }
  ) {
    return this.request(`/warehouse/putaway/${putawayId}/assign-location`, {
      method: "POST",
      body: JSON.stringify(assignDto),
    })
  }

  async updatePutawayTask(taskData: any) {
    return this.request("/warehouse/putaway", {
      method: "PUT",
      body: JSON.stringify(taskData),
    })
  }

  async deletePutawayTask(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/warehouse/putaway?${sp.toString()}`, { method: "DELETE" })
  }

  // Movement Records API
  async getMovementRecords(params?: {
    search?: string
    movementType?: string
    materialId?: string
    fromLocation?: string
    toLocation?: string
    performedBy?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.movementType) searchParams.set("movementType", params.movementType)
    if (params?.materialId) searchParams.set("materialId", params.materialId)
    if (params?.fromLocation) searchParams.set("fromLocation", params.fromLocation)
    if (params?.toLocation) searchParams.set("toLocation", params.toLocation)
    if (params?.performedBy) searchParams.set("performedBy", params.performedBy)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/warehouse/movements${query ? `?${query}` : ""}`)
  }

  async getMovementRecord(id: string) {
    return this.request(`/warehouse/movements/${id}`)
  }

  async createMovementRecord(movementData: any) {
    return this.request("/warehouse/movements", {
      method: "POST",
      body: JSON.stringify(movementData),
    })
  }

  async updateMovementRecord(id: string, movementData: any) {
    return this.request(`/warehouse/movements/${id}`, {
      method: "PUT",
      body: JSON.stringify(movementData),
    })
  }

  async deleteMovementRecord(id: string) {
    return this.request(`/warehouse/movements/${id}`, { method: "DELETE" })
  }

  async getInventoryItem(id: string) {
    return this.request(`/warehouse/inventory/${id}`)
  }

  // Cache invalidation for warehouse data
  invalidateInventoryItems() {
    this.invalidateCache("inventory-items")
  }

  invalidatePutawayTasks() {
    this.invalidateCache("putaway-tasks")
  }

  invalidateMovementRecords() {
    this.invalidateCache("movement-records")
  }

  // Warehouse API
  async getWarehouses(params?: {
    siteId?: number
    status?: string
    type?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.siteId) searchParams.set("siteId", params.siteId.toString())
    if (params?.status) searchParams.set("status", params.status)
    if (params?.type) searchParams.set("type", params.type)

    const query = searchParams.toString()
    return this.request(`/warehouse/warehouses${query ? `?${query}` : ""}`)
  }

  async getWarehouse(id: string) {
    return this.request(`/warehouse/warehouses/${id}`)
  }

  async createWarehouse(warehouseData: any) {
    return this.request("/warehouse/warehouses", {
      method: "POST",
      body: JSON.stringify(warehouseData),
    })
  }

  async updateWarehouse(id: string, warehouseData: any) {
    return this.request(`/warehouse/warehouses/${id}`, {
      method: "PUT",
      body: JSON.stringify(warehouseData),
    })
  }

  async deleteWarehouse(id: string) {
    return this.request(`/warehouse/warehouses/${id}`, { method: "DELETE" })
  }

  // Storage Locations API
  async getStorageLocations(params?: {
    warehouseId?: number
    status?: string
    type?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.warehouseId) searchParams.set("warehouseId", params.warehouseId.toString())
    if (params?.status) searchParams.set("status", params.status)
    if (params?.type) searchParams.set("type", params.type)

    const query = searchParams.toString()
    return this.request(`/warehouse/storage-locations${query ? `?${query}` : ""}`)
  }

  async getStorageLocation(id: string) {
    return this.request(`/warehouse/storage-locations/${id}`)
  }

  async createStorageLocation(locationData: any) {
    return this.request("/warehouse/storage-locations", {
      method: "POST",
      body: JSON.stringify(locationData),
    })
  }

  async updateStorageLocation(id: string, locationData: any) {
    return this.request(`/warehouse/storage-locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(locationData),
    })
  }

  async deleteStorageLocation(id: string) {
    return this.request(`/warehouse/storage-locations/${id}`, { method: "DELETE" })
  }

  // Material Issue API
  async getMaterialIssues(params?: {
    status?: string
    workOrderId?: string
    batchId?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.workOrderId) searchParams.set("workOrderId", params.workOrderId)
    if (params?.batchId) searchParams.set("batchId", params.batchId)

    const query = searchParams.toString()
    return this.request(`/warehouse/material-issues${query ? `?${query}` : ""}`)
  }

  async getMaterialIssue(id: string) {
    return this.request(`/warehouse/material-issues/${id}`)
  }

  async createMaterialIssue(issueData: any) {
    return this.request("/warehouse/material-issues", {
      method: "POST",
      body: JSON.stringify(issueData),
    })
  }

  async approveMaterialIssue(id: string, approveData: { approvedBy: number; remarks?: string }) {
    return this.request(`/warehouse/material-issues/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(approveData),
    })
  }

  async pickMaterialIssue(id: string, pickedBy: number) {
    return this.request(`/warehouse/material-issues/${id}/pick`, {
      method: "POST",
      body: JSON.stringify({ pickedBy }),
    })
  }

  async issueMaterial(id: string, issuedBy: number) {
    return this.request(`/warehouse/material-issues/${id}/issue`, {
      method: "POST",
      body: JSON.stringify({ issuedBy }),
    })
  }
}
