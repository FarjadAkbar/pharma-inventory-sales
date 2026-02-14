"use client"

import { authService } from "./auth.service"
import type { ApiResponse } from "@/types/auth"

class SalesCrmApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:3000/api'
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = authService.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      window.dispatchEvent(new Event("api:request:start"))
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : ({} as any)

      if (!response.ok) {
        throw new Error(data.error || "Request failed")
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    } finally {
      window.dispatchEvent(new Event("api:request:stop"))
    }
  }

  // Accounts API
  async getAccounts(params?: {
    search?: string
    type?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/sales-crm/accounts?${queryParams.toString()}`)
  }

  async getAccount(id: string) {
    return this.request(`/sales-crm/accounts/${id}`)
  }

  async createAccount(accountData: any) {
    return this.request("/sales-crm/accounts", {
      method: "POST",
      body: JSON.stringify(accountData),
    })
  }

  async updateAccount(id: string, accountData: any) {
    return this.request(`/sales-crm/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(accountData),
    })
  }

  async deleteAccount(id: string) {
    return this.request(`/sales-crm/accounts/${id}`, {
      method: "DELETE",
    })
  }

  async searchAccounts(search: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams({ search })
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/sales-crm/accounts/search?${queryParams.toString()}`)
  }

  // Contracts API
  async getContracts(params?: {
    search?: string
    accountId?: string
    type?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/sales-crm/contracts?${queryParams.toString()}`)
  }

  async getContract(id: string) {
    return this.request(`/sales-crm/contracts/${id}`)
  }

  async createContract(contractData: any) {
    return this.request("/sales-crm/contracts", {
      method: "POST",
      body: JSON.stringify(contractData),
    })
  }

  async updateContract(id: string, contractData: any) {
    return this.request(`/sales-crm/contracts/${id}`, {
      method: "PUT",
      body: JSON.stringify(contractData),
    })
  }

  async deleteContract(id: string) {
    return this.request(`/sales-crm/contracts/${id}`, {
      method: "DELETE",
    })
  }

  async renewContract(id: string, renewalData: { renewalDate: string; endDate: string; renewedBy: number }) {
    return this.request(`/sales-crm/contracts/${id}/renew`, {
      method: "POST",
      body: JSON.stringify(renewalData),
    })
  }

  async terminateContract(id: string, terminationData: { terminatedBy: number; reason?: string }) {
    return this.request(`/sales-crm/contracts/${id}/terminate`, {
      method: "POST",
      body: JSON.stringify(terminationData),
    })
  }

  // POS Transactions API
  async getPOSTransactions(params?: {
    search?: string
    siteId?: string
    cashierId?: string
    customerId?: string
    status?: string
    paymentStatus?: string
    paymentMethod?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/sales-crm/pos/transactions?${queryParams.toString()}`)
  }

  async getPOSTransaction(id: string) {
    return this.request(`/sales-crm/pos/transactions/${id}`)
  }

  async createPOSTransaction(transactionData: any) {
    return this.request("/sales-crm/pos/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }

  async updatePOSTransaction(id: string, transactionData: any) {
    return this.request(`/sales-crm/pos/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transactionData),
    })
  }

  async deletePOSTransaction(id: string) {
    return this.request(`/sales-crm/pos/transactions/${id}`, {
      method: "DELETE",
    })
  }

  async voidTransaction(id: string, voidedBy: number) {
    return this.request(`/sales-crm/pos/transactions/${id}/void`, {
      method: "POST",
      body: JSON.stringify({ voidedBy }),
    })
  }

  async refundTransaction(id: string, refundData: { refundedBy: number; amount?: number; reason?: string }) {
    return this.request(`/sales-crm/pos/transactions/${id}/refund`, {
      method: "POST",
      body: JSON.stringify(refundData),
    })
  }
}

export const salesCrmApi = new SalesCrmApiService()
