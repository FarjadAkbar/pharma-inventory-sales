"use client"

import { BaseApiService } from "./base-api.service"
import type { 
  PurchaseOrderApiResponse, 
  CreatePurchaseOrderData, 
  UpdatePurchaseOrderData,
  SupplierListApiResponse 
} from "@/types/purchase-orders"

export class PurchaseOrdersApiService extends BaseApiService {
  async getAllPurchaseOrders(): Promise<PurchaseOrderApiResponse> {
    console.log("API getAllPurchaseOrders called at:", new Date().toISOString())
    return this.rawRequest<PurchaseOrderApiResponse>("/purchaseorders/all")
  }

  async getPurchaseOrdersBySite(siteId: number): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>(`/purchaseorders/site/${siteId}`)
  }

  async getSuppliersList(): Promise<SupplierListApiResponse> {
    return this.rawRequest<SupplierListApiResponse>("/purchaseorders/supplier/all")
  }

  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>("/purchaseorders", {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  async updatePurchaseOrder(id: number, data: UpdatePurchaseOrderData): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>(`/purchaseorders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })
  }

  async deletePurchaseOrder(id: number): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>(`/purchaseorders/${id}`, {
      method: "DELETE"
    })
  }

  async deletePurchaseOrderItem(poId: number, itemId: number): Promise<PurchaseOrderApiResponse> {
    return this.rawRequest<PurchaseOrderApiResponse>(`/purchaseorders/${poId}/items/${itemId}`, {
      method: "DELETE"
    })
  }

  invalidatePurchaseOrders() {
    this.invalidateCache("purchase-orders")
  }
}
