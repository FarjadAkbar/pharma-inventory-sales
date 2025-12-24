"use client"

import { BaseApiService } from "./base-api.service"

export interface GoodsReceiptItem {
  id: number
  goodsReceiptId: number
  purchaseOrderItemId: number
  purchaseOrderItem?: {
    id: number
    rawMaterialId: number
    quantity: number
    unitPrice: number
  }
  receivedQuantity: number
  acceptedQuantity: number
  rejectedQuantity: number
  batchNumber?: string
  expiryDate?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface GoodsReceipt {
  id: number
  grnNumber: string
  purchaseOrderId: number
  purchaseOrder?: {
    id: number
    poNumber: string
    supplierId: number
    siteId?: number
  }
  receivedDate: Date | string
  status: 'Draft' | 'Verified' | 'Completed'
  remarks?: string
  items?: GoodsReceiptItem[]
  createdAt: Date | string
  updatedAt: Date | string
}

export class GoodsReceiptsApiService extends BaseApiService {
  // Goods Receipts API
  async getGoodsReceipts(params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<GoodsReceipt[]> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    const response = await this.rawRequest<GoodsReceipt[]>(`/goods-receipts${query ? `?${query}` : ""}`)
    // Backend returns array directly, not wrapped in ApiResponse
    return response
  }

  async getGoodsReceipt(id: string) {
    return this.rawRequest<GoodsReceipt>(`/goods-receipts/${id}`)
  }

  async createGoodsReceipt(goodsReceiptData: { 
    purchaseOrderId: number
    receivedDate: string
    remarks?: string
    items: Array<{
      purchaseOrderItemId: number
      receivedQuantity: number
      acceptedQuantity: number
      rejectedQuantity: number
      batchNumber?: string
      expiryDate?: string
    }>
    status?: 'Draft' | 'Verified' | 'Completed'
  }) {
    return this.rawRequest<GoodsReceipt>("/goods-receipts", {
      method: "POST",
      body: JSON.stringify(goodsReceiptData),
    })
  }

  async updateGoodsReceipt(id: string, goodsReceiptData: { 
    receivedDate?: string
    remarks?: string
    items?: Array<{
      purchaseOrderItemId: number
      receivedQuantity: number
      acceptedQuantity: number
      rejectedQuantity: number
      batchNumber?: string
      expiryDate?: string
    }>
    status?: 'Draft' | 'Verified' | 'Completed'
  }) {
    return this.rawRequest<GoodsReceipt>(`/goods-receipts/${id}`, {
      method: "PUT",
      body: JSON.stringify(goodsReceiptData),
    })
  }

  async deleteGoodsReceipt(id: string) {
    return this.rawRequest(`/goods-receipts/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for goods receipts
  invalidateGoodsReceipts() {
    this.invalidateCache("goods-receipts")
  }
}

export const goodsReceiptsApiService = new GoodsReceiptsApiService()

