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
