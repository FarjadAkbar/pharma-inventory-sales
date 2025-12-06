"use client"

import { BaseApiService } from "./base-api.service"

export class StoresApiService extends BaseApiService {
  // Sites/Stores API
  async getStores() {
    return this.request(`/sites`)
  }

  async createStore(payload: any) {
    return this.request(`/sites`, { method: "POST", body: JSON.stringify(payload) })
  }

  async updateStore(id: string, payload: any) {
    return this.request(`/sites/${id}`, { method: "PUT", body: JSON.stringify(payload) })
  }

  async deleteStore(id: string) {
    return this.request(`/sites/${id}`, { method: "DELETE" })
  }

  // Cache invalidation for stores
  invalidateStores() {
    this.invalidateCache("sites")
  }
}
