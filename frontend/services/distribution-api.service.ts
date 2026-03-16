"use client"

import { BaseApiService } from "./base-api.service"

export class DistributionApiService extends BaseApiService {
  // Sales Orders API
  async getSalesOrders(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/sales/sales-orders?${queryParams.toString()}`)
  }

  async getSalesOrder(id: string) {
    return this.request(`/sales/sales-orders/${id}`)
  }

  async createSalesOrder(orderData: any) {
    return this.request("/sales/sales-orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  async updateSalesOrder(id: string, orderData: any) {
    return this.request(`/sales/sales-orders`, {
      method: "PUT",
      body: JSON.stringify({ id, ...orderData }),
    })
  }

  async approveSalesOrder(id: string, approvedBy: number) {
    return this.request(`/sales/sales-orders/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ approvedBy }),
    })
  }

  async cancelSalesOrder(id: string) {
    return this.request(`/sales/sales-orders/${id}/cancel`, {
      method: "POST",
    })
  }

  async deleteSalesOrder(id: string) {
    return this.request(`/sales/sales-orders?id=${id}`, {
      method: "DELETE",
    })
  }

  // Shipments API
  async getShipments(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/sales/shipments?${queryParams.toString()}`)
  }

  async getShipment(id: string) {
    return this.request(`/sales/shipments/${id}`)
  }

  async getShipmentsBySalesOrder(salesOrderId: string) {
    return this.request(`/sales/shipments/sales-order/${salesOrderId}`)
  }

  async createShipment(shipmentData: any) {
    return this.request("/sales/shipments", {
      method: "POST",
      body: JSON.stringify(shipmentData),
    })
  }

  async updateShipment(id: string, shipmentData: any) {
    return this.request(`/sales/shipments`, {
      method: "PUT",
      body: JSON.stringify({ id, ...shipmentData }),
    })
  }

  async allocateStock(allocateData: any) {
    return this.request("/sales/shipments/allocate-stock", {
      method: "POST",
      body: JSON.stringify(allocateData),
    })
  }

  async pickItem(pickData: any) {
    return this.request("/sales/shipments/pick-item", {
      method: "POST",
      body: JSON.stringify(pickData),
    })
  }

  async packItem(packData: any) {
    return this.request("/sales/shipments/pack-item", {
      method: "POST",
      body: JSON.stringify(packData),
    })
  }

  async shipOrder(id: string, shipData: any) {
    return this.request(`/sales/shipments/${id}/ship`, {
      method: "POST",
      body: JSON.stringify(shipData),
    })
  }

  async cancelShipment(id: string) {
    return this.request(`/sales/shipments/${id}/cancel`, {
      method: "POST",
    })
  }

  async deleteShipment(id: string) {
    return this.request(`/sales/shipments?id=${id}`, {
      method: "DELETE",
    })
  }

  /** Fetch shipment items by listing shipments and flattening items. No dedicated list endpoint. */
  async getShipmentItems(params?: {
    search?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const res = await this.getShipments({
      search: params?.search,
      status: params?.status,
      page: 1,
      limit: 500,
    })
    if (!res?.data) return { success: true, data: { items: [], pagination: { page: 1, pages: 1, total: 0 } } }
    const raw = res.data as any
    const shipments = Array.isArray(raw) ? raw : raw.data ?? []
    const items: any[] = []
    shipments.forEach((s: any) => {
      const shipmentNumber = s.shipmentNumber ?? s.shipment_number
      const salesOrderNumber = s.salesOrderNumber ?? s.sales_order_number
      const shipmentId = s.id ?? s.shipmentId
      const arr = s.items ?? []
      arr.forEach((it: any) => {
        const status = (it.status ?? "pending").toString().toLowerCase()
        if (params?.status && params.status.toLowerCase() !== status) return
        items.push({
          ...it,
          shipmentId: shipmentId ?? it.shipmentId,
          shipmentNumber,
          salesOrderNumber,
          salesOrderId: s.salesOrderId ?? s.sales_order_id,
          productId: it.drugId ?? it.productId,
          productName: it.drugName ?? it.productName,
          productCode: it.drugCode ?? it.productCode,
          orderedQuantity: it.quantity ?? it.orderedQuantity,
          shippedQuantity: it.packedQuantity ?? it.pickedQuantity ?? it.quantity ?? it.shippedQuantity,
          unitName: it.unit ?? it.unitName,
          status,
        })
      })
    })
    const total = items.length
    const start = (page - 1) * limit
    const paginated = items.slice(start, start + limit)
    return {
      success: true,
      data: {
        items: paginated,
        pagination: { page, pages: Math.max(1, Math.ceil(total / limit)), total },
      },
    }
  }

  // Proof of Deliveries API
  async getProofOfDeliveries(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/sales/proof-of-delivery?${queryParams.toString()}`)
  }

  async getProofOfDelivery(id: string) {
    return this.request(`/sales/proof-of-delivery/${id}`)
  }

  async getProofOfDeliveriesByShipment(shipmentId: string) {
    return this.request(`/sales/proof-of-delivery/shipment/${shipmentId}`)
  }

  async createProofOfDelivery(podData: any) {
    return this.request("/sales/proof-of-delivery", {
      method: "POST",
      body: JSON.stringify(podData),
    })
  }

  async completeProofOfDelivery(id: string, completedBy: number) {
    return this.request(`/sales/proof-of-delivery/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ completedBy }),
    })
  }

  // Cache invalidation for distribution data
  invalidateSalesOrders() {
    this.invalidateCache("sales-orders")
  }

  invalidateShipments() {
    this.invalidateCache("shipments")
  }

  invalidateProofOfDeliveries() {
    this.invalidateCache("proof-of-deliveries")
  }
}
