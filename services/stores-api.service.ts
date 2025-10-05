"use client"

import { BaseApiService } from "./base-api.service"

export class StoresApiService extends BaseApiService {
  // Stores API
  async getStores() {
    return this.request(`/stores`)
  }

  async createStore(payload: any) {
    return this.request(`/stores`, { method: "POST", body: JSON.stringify(payload) })
  }

  async updateStore(id: string, payload: any) {
    return this.request(`/stores/${id}`, { method: "PUT", body: JSON.stringify(payload) })
  }

  async deleteStore(id: string) {
    return this.request(`/stores/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for stores
  invalidateStores() {
    this.invalidateCache("stores")
  }
}
