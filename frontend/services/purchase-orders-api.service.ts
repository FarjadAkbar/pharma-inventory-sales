"use client"

import { BaseApiService } from "./base-api.service"

export interface PurchaseOrderItem {
  id: number
  purchaseOrderId: number
  rawMaterialId: number
  rawMaterial?: {
    id: number
    name: string
    code: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface PurchaseOrder {
  id: number
  poNumber: string
  supplierId: number
  supplier?: {
    id: number
    name: string
    contactPerson: string
    email: string
  }
  siteId?: number
  site?: {
    id: number
    name: string
    address?: string
    city?: string
  }
  expectedDate: Date | string
  status: 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled'
  totalAmount: number
  items?: PurchaseOrderItem[]
  createdAt: Date | string
  updatedAt: Date | string
}

export class PurchaseOrdersApiService extends BaseApiService {
  // Purchase Orders API
  async getPurchaseOrders(params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<PurchaseOrder[]> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    const response = await this.rawRequest<PurchaseOrder[]>(`/purchase-orders${query ? `?${query}` : ""}`)
    // Backend returns array directly, not wrapped in ApiResponse
    return response
  }

  async getPurchaseOrder(id: string) {
    return this.rawRequest<PurchaseOrder>(`/purchase-orders/${id}`)
  }

  async createPurchaseOrder(purchaseOrderData: { 
    supplierId: number
    siteId?: number
    expectedDate: string
    items: Array<{
      rawMaterialId: number
      quantity: number
      unitPrice: number
    }>
    status?: 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled'
  }) {
    return this.rawRequest<PurchaseOrder>("/purchase-orders", {
      method: "POST",
      body: JSON.stringify(purchaseOrderData),
    })
  }

  async updatePurchaseOrder(id: string, purchaseOrderData: { 
    supplierId?: number
    siteId?: number
    expectedDate?: string
    items?: Array<{
      rawMaterialId: number
      quantity: number
      unitPrice: number
    }>
    status?: 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled'
  }) {
    return this.rawRequest<PurchaseOrder>(`/purchase-orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(purchaseOrderData),
    })
  }

  async deletePurchaseOrder(id: string) {
    return this.rawRequest(`/purchase-orders/${id}`, { method: "DELETE" })
  }

  async approvePurchaseOrder(id: string) {
    return this.rawRequest<PurchaseOrder>(`/purchase-orders/${id}/approve`, {
      method: "POST",
    })
  }

  async cancelPurchaseOrder(id: string) {
    return this.rawRequest<PurchaseOrder>(`/purchase-orders/${id}/cancel`, {
      method: "POST",
    })
  }

  // Cache invalidation for purchase orders
  invalidatePurchaseOrders() {
    this.invalidateCache("purchase-orders")
  }
}

export const purchaseOrdersApiService = new PurchaseOrdersApiService()
