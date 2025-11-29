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
    return this.request(`/distribution/sales-orders?${queryParams.toString()}`)
  }

  async createSalesOrder(orderData: any) {
    return this.request("/distribution/sales-orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  async updateSalesOrder(id: string, orderData: any) {
    return this.request(`/distribution/sales-orders`, {
      method: "PUT",
      body: JSON.stringify({ id, ...orderData }),
    })
  }

  async deleteSalesOrder(id: string) {
    return this.request(`/distribution/sales-orders?id=${id}`, {
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
    return this.request(`/distribution/shipments?${queryParams.toString()}`)
  }

  async createShipment(shipmentData: any) {
    return this.request("/distribution/shipments", {
      method: "POST",
      body: JSON.stringify(shipmentData),
    })
  }

  async updateShipment(id: string, shipmentData: any) {
    return this.request(`/distribution/shipments`, {
      method: "PUT",
      body: JSON.stringify({ id, ...shipmentData }),
    })
  }

  async deleteShipment(id: string) {
    return this.request(`/distribution/shipments?id=${id}`, {
      method: "DELETE",
    })
  }

  // Cold Chain Records API
  async getColdChainRecords(filters: any = {}) {
    const queryParams = new URLSearchParams()
    queryParams.append("type", "records")
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/distribution/cold-chain?${queryParams.toString()}`)
  }

  async getTemperatureExcursions(filters: any = {}) {
    const queryParams = new URLSearchParams()
    queryParams.append("type", "excursions")
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/distribution/cold-chain?${queryParams.toString()}`)
  }

  async createColdChainRecord(recordData: any) {
    return this.request("/distribution/cold-chain", {
      method: "POST",
      body: JSON.stringify({ type: "record", ...recordData }),
    })
  }

  async createTemperatureExcursion(excursionData: any) {
    return this.request("/distribution/cold-chain", {
      method: "POST",
      body: JSON.stringify({ type: "excursion", ...excursionData }),
    })
  }

  async updateColdChainRecord(id: string, recordData: any) {
    return this.request(`/distribution/cold-chain`, {
      method: "PUT",
      body: JSON.stringify({ type: "record", id, ...recordData }),
    })
  }

  async updateTemperatureExcursion(id: string, excursionData: any) {
    return this.request(`/distribution/cold-chain`, {
      method: "PUT",
      body: JSON.stringify({ type: "excursion", id, ...excursionData }),
    })
  }

  async deleteColdChainRecord(id: string) {
    return this.request(`/distribution/cold-chain?type=record&id=${id}`, {
      method: "DELETE",
    })
  }

  async deleteTemperatureExcursion(id: string) {
    return this.request(`/distribution/cold-chain?type=excursion&id=${id}`, {
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
    return this.request(`/distribution/pod?${queryParams.toString()}`)
  }

  async createProofOfDelivery(podData: any) {
    return this.request("/distribution/pod", {
      method: "POST",
      body: JSON.stringify(podData),
    })
  }

  async updateProofOfDelivery(id: string, podData: any) {
    return this.request(`/distribution/pod`, {
      method: "PUT",
      body: JSON.stringify({ id, ...podData }),
    })
  }

  async deleteProofOfDelivery(id: string) {
    return this.request(`/distribution/pod?id=${id}`, {
      method: "DELETE",
    })
  }

  // Cache invalidation for distribution data
  invalidateSalesOrders() {
    this.invalidateCache("sales-orders")
  }

  invalidateShipments() {
    this.invalidateCache("shipments")
  }

  invalidateColdChainRecords() {
    this.invalidateCache("cold-chain-records")
  }

  invalidateTemperatureExcursions() {
    this.invalidateCache("temperature-excursions")
  }

  invalidateProofOfDeliveries() {
    this.invalidateCache("proof-of-deliveries")
  }
}
