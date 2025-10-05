"use client"

import { BaseApiService } from "./base-api.service"

export class ProcurementApiService extends BaseApiService {
  // Purchase Orders API
  async getPurchaseOrders(params?: {
    search?: string
    supplierId?: string
    status?: string
    siteId?: string
    dateFrom?: string
    dateTo?: string
    amountMin?: number
    amountMax?: number
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.supplierId) searchParams.set("supplierId", params.supplierId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.siteId) searchParams.set("siteId", params.siteId)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.amountMin) searchParams.set("amountMin", params.amountMin.toString())
    if (params?.amountMax) searchParams.set("amountMax", params.amountMax.toString())
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/procurement/purchase-orders${query ? `?${query}` : ""}`)
  }

  async createPurchaseOrder(poData: any) {
    return this.request("/procurement/purchase-orders", {
      method: "POST",
      body: JSON.stringify(poData),
    })
  }

  async updatePurchaseOrder(poData: any) {
    return this.request("/procurement/purchase-orders", {
      method: "PUT",
      body: JSON.stringify(poData),
    })
  }

  async deletePurchaseOrder(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/procurement/purchase-orders?${sp.toString()}`, { method: "DELETE" })
  }

  // Goods Receipts API
  async getGoodsReceipts(params?: {
    search?: string
    poId?: string
    supplierId?: string
    status?: string
    siteId?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.poId) searchParams.set("poId", params.poId)
    if (params?.supplierId) searchParams.set("supplierId", params.supplierId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.siteId) searchParams.set("siteId", params.siteId)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/procurement/goods-receipts${query ? `?${query}` : ""}`)
  }

  async createGoodsReceipt(grnData: any) {
    return this.request("/procurement/goods-receipts", {
      method: "POST",
      body: JSON.stringify(grnData),
    })
  }

  async updateGoodsReceipt(grnData: any) {
    return this.request("/procurement/goods-receipts", {
      method: "PUT",
      body: JSON.stringify(grnData),
    })
  }

  async deleteGoodsReceipt(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/procurement/goods-receipts?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for procurement data
  invalidatePurchaseOrders() {
    this.invalidateCache("purchase-orders")
  }

  invalidateGoodsReceipts() {
    this.invalidateCache("goods-receipts")
  }
}
