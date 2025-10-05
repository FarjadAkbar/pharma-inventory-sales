"use client"

import { authService } from "./auth.service"
import type { ApiResponse } from "@/types/auth"

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:3000/api'
  private getCurrentStoreId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("current_store_id")
  }

  // Generic request method with authentication
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = authService.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const storeId = this.getCurrentStoreId()
    if (storeId) {
      headers["x-store-id"] = storeId
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
    }
    finally {
      window.dispatchEvent(new Event("api:request:stop"))
    }
  }

  // Products API
  async getProducts(params?: {
    search?: string
    category?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.category) searchParams.set("category", params.category)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/products${query ? `?${query}` : ""}`)
  }

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

  async getProduct(id: string) {
    return this.request(`/products/${id}`)
  }

  async createProduct(productData: any) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    })
  }

  // Vendors API
  async getVendors(params?: {
    search?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/vendors${query ? `?${query}` : ""}`)
  }

  async createVendor(vendorData: any) {
    return this.request("/vendors", {
      method: "POST",
      body: JSON.stringify(vendorData),
    })
  }

  // Users API (Direct backend calls)
  async getUsers(params?: {
    search?: string
    role?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.role) searchParams.set("role", params.role)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/users${query ? `?${query}` : ""}`)
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userData: any) {
    return this.request("/users", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/users?${sp.toString()}`, { method: "DELETE" })
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { method: 'GET' })
  }
  
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }
  
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }
  
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { method: 'DELETE' })
  }
  
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> { 
    return await this.request<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined, 
    })
  }

  // Cache invalidation methods
  invalidateCache(key: string) {
    // In a real app, this would work with a caching layer like React Query
    console.log(`Invalidating cache for: ${key}`)
  }

  invalidateProducts() {
    this.invalidateCache("products")
  }

  invalidateVendors() {
    this.invalidateCache("vendors")
  }

  invalidateUsers() {
    this.invalidateCache("users")
  }

  // Pharmaceutical Master Data API
  // Drugs API
  async getDrugs(params?: {
    search?: string
    dosageForm?: string
    route?: string
    approvalStatus?: string
    therapeuticClass?: string
    manufacturer?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.dosageForm) searchParams.set("dosageForm", params.dosageForm)
    if (params?.route) searchParams.set("route", params.route)
    if (params?.approvalStatus) searchParams.set("approvalStatus", params.approvalStatus)
    if (params?.therapeuticClass) searchParams.set("therapeuticClass", params.therapeuticClass)
    if (params?.manufacturer) searchParams.set("manufacturer", params.manufacturer)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/master-data/drugs${query ? `?${query}` : ""}`)
  }

  async createDrug(drugData: any) {
    return this.request("/master-data/drugs", {
      method: "POST",
      body: JSON.stringify(drugData),
    })
  }

  async updateDrug(drugData: any) {
    return this.request("/master-data/drugs", {
      method: "PUT",
      body: JSON.stringify(drugData),
    })
  }

  async deleteDrug(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/master-data/drugs?${sp.toString()}`, { method: "DELETE" })
  }

  // Raw Materials API
  async getRawMaterials(params?: {
    search?: string
    grade?: string
    supplierId?: string
    isActive?: boolean
    lowStock?: boolean
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.grade) searchParams.set("grade", params.grade)
    if (params?.supplierId) searchParams.set("supplierId", params.supplierId)
    if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())
    if (params?.lowStock) searchParams.set("lowStock", params.lowStock.toString())
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/master-data/raw-materials${query ? `?${query}` : ""}`)
  }

  async createRawMaterial(materialData: any) {
    return this.request("/master-data/raw-materials", {
      method: "POST",
      body: JSON.stringify(materialData),
    })
  }

  async updateRawMaterial(materialData: any) {
    return this.request("/master-data/raw-materials", {
      method: "PUT",
      body: JSON.stringify(materialData),
    })
  }

  async deleteRawMaterial(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/master-data/raw-materials?${sp.toString()}`, { method: "DELETE" })
  }

  // Suppliers API
  async getSuppliers(params?: {
    search?: string
    rating?: number
    isActive?: boolean
    performance?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.rating) searchParams.set("rating", params.rating.toString())
    if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())
    if (params?.performance) searchParams.set("performance", params.performance)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/master-data/suppliers${query ? `?${query}` : ""}`)
  }

  async createSupplier(supplierData: any) {
    return this.request("/master-data/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierData),
    })
  }

  async updateSupplier(supplierData: any) {
    return this.request("/master-data/suppliers", {
      method: "PUT",
      body: JSON.stringify(supplierData),
    })
  }

  async deleteSupplier(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/master-data/suppliers?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for pharmaceutical data
  invalidateDrugs() {
    this.invalidateCache("drugs")
  }

  invalidateRawMaterials() {
    this.invalidateCache("raw-materials")
  }

  invalidateSuppliers() {
    this.invalidateCache("suppliers")
  }

  // Procurement API
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

  // Sites API
  async getSites() {
    return this.request("/site/getAllSites")
  }

  // Cache invalidation for procurement data
  invalidatePurchaseOrders() {
    this.invalidateCache("purchase-orders")
  }

  invalidateGoodsReceipts() {
    this.invalidateCache("goods-receipts")
  }

  invalidateSites() {
    this.invalidateCache("sites")
  }

  // Quality Control API
  // QC Tests API
  async getQCTests(params?: {
    search?: string
    category?: string
    isActive?: boolean
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.category) searchParams.set("category", params.category)
    if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString())
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/quality-control/qc-tests${query ? `?${query}` : ""}`)
  }

  async createQCTest(testData: any) {
    return this.request("/quality-control/qc-tests", {
      method: "POST",
      body: JSON.stringify(testData),
    })
  }

  async updateQCTest(testData: any) {
    return this.request("/quality-control/qc-tests", {
      method: "PUT",
      body: JSON.stringify(testData),
    })
  }

  async deleteQCTest(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/quality-control/qc-tests?${sp.toString()}`, { method: "DELETE" })
  }

  // QC Samples API
  async getQCSamples(params?: {
    search?: string
    sourceType?: string
    status?: string
    priority?: string
    assignedTo?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.sourceType) searchParams.set("sourceType", params.sourceType)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/quality-control/qc-samples${query ? `?${query}` : ""}`)
  }

  async getQCSample(id: string) {
    return this.request(`/quality-control/qc-samples/${id}`)
  }

  async createQCSample(sampleData: any) {
    return this.request("/quality-control/qc-samples", {
      method: "POST",
      body: JSON.stringify(sampleData),
    })
  }

  async updateQCSample(sampleData: any) {
    return this.request("/quality-control/qc-samples", {
      method: "PUT",
      body: JSON.stringify(sampleData),
    })
  }

  async updateQCSampleResults(id: string, resultsData: any) {
    return this.request(`/quality-control/qc-samples/${id}/results`, {
      method: "PUT",
      body: JSON.stringify(resultsData),
    })
  }

  async deleteQCSample(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/quality-control/qc-samples?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for quality control data
  invalidateQCTests() {
    this.invalidateCache("qc-tests")
  }

  invalidateQCSamples() {
    this.invalidateCache("qc-samples")
  }

  // Quality Assurance API
  // QA Releases API
  async getQAReleases(params?: {
    search?: string
    entityType?: string
    status?: string
    priority?: string
    reviewedBy?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.entityType) searchParams.set("entityType", params.entityType)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.reviewedBy) searchParams.set("reviewedBy", params.reviewedBy)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/quality-assurance/qa-releases${query ? `?${query}` : ""}`)
  }

  async getQARelease(id: string) {
    return this.request(`/quality-assurance/qa-releases/${id}`)
  }

  async createQARelease(releaseData: any) {
    return this.request("/quality-assurance/qa-releases", {
      method: "POST",
      body: JSON.stringify(releaseData),
    })
  }

  async updateQARelease(releaseData: any) {
    return this.request("/quality-assurance/qa-releases", {
      method: "PUT",
      body: JSON.stringify(releaseData),
    })
  }

  async deleteQARelease(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/quality-assurance/qa-releases?${sp.toString()}`, { method: "DELETE" })
  }

  // QA Deviations API
  async getQADeviations(params?: {
    search?: string
    severity?: string
    category?: string
    status?: string
    assignedTo?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.severity) searchParams.set("severity", params.severity)
    if (params?.category) searchParams.set("category", params.category)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/quality-assurance/deviations${query ? `?${query}` : ""}`)
  }

  async getQADeviation(id: string) {
    return this.request(`/quality-assurance/deviations/${id}`)
  }

  async createQADeviation(deviationData: any) {
    return this.request("/quality-assurance/deviations", {
      method: "POST",
      body: JSON.stringify(deviationData),
    })
  }

  async updateQADeviation(deviationData: any) {
    return this.request("/quality-assurance/deviations", {
      method: "PUT",
      body: JSON.stringify(deviationData),
    })
  }

  async deleteQADeviation(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/quality-assurance/deviations?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for quality assurance data
  invalidateQAReleases() {
    this.invalidateCache("qa-releases")
  }

  invalidateQADeviations() {
    this.invalidateCache("qa-deviations")
  }

  // Manufacturing API
  // BOMs API
  async getBOMs(params?: {
    search?: string
    drugId?: string
    status?: string
    version?: number
    createdBy?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.drugId) searchParams.set("drugId", params.drugId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.version) searchParams.set("version", params.version.toString())
    if (params?.createdBy) searchParams.set("createdBy", params.createdBy)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/manufacturing/boms${query ? `?${query}` : ""}`)
  }

  async createBOM(bomData: any) {
    return this.request("/manufacturing/boms", {
      method: "POST",
      body: JSON.stringify(bomData),
    })
  }

  async updateBOM(bomData: any) {
    return this.request("/manufacturing/boms", {
      method: "PUT",
      body: JSON.stringify(bomData),
    })
  }

  async deleteBOM(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/manufacturing/boms?${sp.toString()}`, { method: "DELETE" })
  }

  // Work Orders API
  async getWorkOrders(params?: {
    search?: string
    drugId?: string
    siteId?: string
    status?: string
    priority?: string
    assignedTo?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.drugId) searchParams.set("drugId", params.drugId)
    if (params?.siteId) searchParams.set("siteId", params.siteId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/manufacturing/work-orders${query ? `?${query}` : ""}`)
  }

  async createWorkOrder(workOrderData: any) {
    return this.request("/manufacturing/work-orders", {
      method: "POST",
      body: JSON.stringify(workOrderData),
    })
  }

  async updateWorkOrder(workOrderData: any) {
    return this.request("/manufacturing/work-orders", {
      method: "PUT",
      body: JSON.stringify(workOrderData),
    })
  }

  async deleteWorkOrder(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/manufacturing/work-orders?${sp.toString()}`, { method: "DELETE" })
  }

  // Batches API
  async getBatches(params?: {
    search?: string
    drugId?: string
    siteId?: string
    status?: string
    priority?: string
    createdBy?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.drugId) searchParams.set("drugId", params.drugId)
    if (params?.siteId) searchParams.set("siteId", params.siteId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.createdBy) searchParams.set("createdBy", params.createdBy)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/manufacturing/batches${query ? `?${query}` : ""}`)
  }

  async createBatch(batchData: any) {
    return this.request("/manufacturing/batches", {
      method: "POST",
      body: JSON.stringify(batchData),
    })
  }

  async updateBatch(batchData: any) {
    return this.request("/manufacturing/batches", {
      method: "PUT",
      body: JSON.stringify(batchData),
    })
  }

  async deleteBatch(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/manufacturing/batches?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for manufacturing data
  invalidateBOMs() {
    this.invalidateCache("boms")
  }

  invalidateWorkOrders() {
    this.invalidateCache("work-orders")
  }

  invalidateBatches() {
    this.invalidateCache("batches")
  }

  // Warehouse Operations API
  // Inventory API
  async getInventoryItems(params?: {
    search?: string
    materialId?: string
    status?: string
    zone?: string
    location?: string
    expiryDateFrom?: string
    expiryDateTo?: string
    temperatureMin?: number
    temperatureMax?: number
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.materialId) searchParams.set("materialId", params.materialId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.zone) searchParams.set("zone", params.zone)
    if (params?.location) searchParams.set("location", params.location)
    if (params?.expiryDateFrom) searchParams.set("expiryDateFrom", params.expiryDateFrom)
    if (params?.expiryDateTo) searchParams.set("expiryDateTo", params.expiryDateTo)
    if (params?.temperatureMin) searchParams.set("temperatureMin", params.temperatureMin.toString())
    if (params?.temperatureMax) searchParams.set("temperatureMax", params.temperatureMax.toString())
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/warehouse/inventory${query ? `?${query}` : ""}`)
  }

  async createInventoryItem(itemData: any) {
    return this.request("/warehouse/inventory", {
      method: "POST",
      body: JSON.stringify(itemData),
    })
  }

  async updateInventoryItem(itemData: any) {
    return this.request("/warehouse/inventory", {
      method: "PUT",
      body: JSON.stringify(itemData),
    })
  }

  async deleteInventoryItem(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/warehouse/inventory?${sp.toString()}`, { method: "DELETE" })
  }

  // Putaway Tasks API
  async getPutawayTasks(params?: {
    search?: string
    status?: string
    priority?: string
    assignedTo?: string
    zone?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.priority) searchParams.set("priority", params.priority)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.zone) searchParams.set("zone", params.zone)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/warehouse/putaway${query ? `?${query}` : ""}`)
  }

  async createPutawayTask(taskData: any) {
    return this.request("/warehouse/putaway", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  async updatePutawayTask(taskData: any) {
    return this.request("/warehouse/putaway", {
      method: "PUT",
      body: JSON.stringify(taskData),
    })
  }

  async deletePutawayTask(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/warehouse/putaway?${sp.toString()}`, { method: "DELETE" })
  }

  // Movement Records API
  async getMovementRecords(params?: {
    search?: string
    movementType?: string
    materialId?: string
    fromLocation?: string
    toLocation?: string
    performedBy?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.movementType) searchParams.set("movementType", params.movementType)
    if (params?.materialId) searchParams.set("materialId", params.materialId)
    if (params?.fromLocation) searchParams.set("fromLocation", params.fromLocation)
    if (params?.toLocation) searchParams.set("toLocation", params.toLocation)
    if (params?.performedBy) searchParams.set("performedBy", params.performedBy)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/warehouse/movements${query ? `?${query}` : ""}`)
  }

  async createMovementRecord(movementData: any) {
    return this.request("/warehouse/movements", {
      method: "POST",
      body: JSON.stringify(movementData),
    })
  }

  async updateMovementRecord(movementData: any) {
    return this.request("/warehouse/movements", {
      method: "PUT",
      body: JSON.stringify(movementData),
    })
  }

  async deleteMovementRecord(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/warehouse/movements?${sp.toString()}`, { method: "DELETE" })
  }

  // Cycle Counts API
  async getCycleCounts(params?: {
    search?: string
    countType?: string
    status?: string
    assignedTo?: string
    zone?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.countType) searchParams.set("countType", params.countType)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo)
    if (params?.zone) searchParams.set("zone", params.zone)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/warehouse/cycle-counts${query ? `?${query}` : ""}`)
  }

  async createCycleCount(countData: any) {
    return this.request("/warehouse/cycle-counts", {
      method: "POST",
      body: JSON.stringify(countData),
    })
  }

  async updateCycleCount(countData: any) {
    return this.request("/warehouse/cycle-counts", {
      method: "PUT",
      body: JSON.stringify(countData),
    })
  }

  async deleteCycleCount(id: string) {
    const sp = new URLSearchParams({ id })
    return this.request(`/warehouse/cycle-counts?${sp.toString()}`, { method: "DELETE" })
  }

  // Cache invalidation for warehouse data
  invalidateInventoryItems() {
    this.invalidateCache("inventory-items")
  }

  invalidatePutawayTasks() {
    this.invalidateCache("putaway-tasks")
  }

  invalidateMovementRecords() {
    this.invalidateCache("movement-records")
  }

  invalidateCycleCounts() {
    this.invalidateCache("cycle-counts")
  }

  // Distribution & Sales API Methods
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

  // Reporting & Analytics API Methods
  async getExecutiveDashboard(period?: string) {
    const queryParams = new URLSearchParams()
    if (period) queryParams.append("period", period)
    return this.request(`/reports/executive?${queryParams.toString()}`)
  }

  async getProcurementDashboard(period?: string) {
    const queryParams = new URLSearchParams()
    if (period) queryParams.append("period", period)
    return this.request(`/reports/procurement?${queryParams.toString()}`)
  }

  async getProductionDashboard(period?: string) {
    const queryParams = new URLSearchParams()
    if (period) queryParams.append("period", period)
    return this.request(`/reports/production?${queryParams.toString()}`)
  }

  async getQualityDashboard(period?: string) {
    const queryParams = new URLSearchParams()
    if (period) queryParams.append("period", period)
    return this.request(`/reports/quality?${queryParams.toString()}`)
  }

  async getWarehouseDashboard(period?: string) {
    const queryParams = new URLSearchParams()
    if (period) queryParams.append("period", period)
    return this.request(`/reports/warehouse?${queryParams.toString()}`)
  }

  async getSalesDashboard(period?: string) {
    const queryParams = new URLSearchParams()
    if (period) queryParams.append("period", period)
    return this.request(`/reports/sales?${queryParams.toString()}`)
  }

  async getAuditTrails(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/reports/audit?${queryParams.toString()}`)
  }

  async getReportTemplates() {
    return this.request("/reports/templates")
  }

  async createReportTemplate(templateData: any) {
    return this.request("/reports/templates", {
      method: "POST",
      body: JSON.stringify(templateData),
    })
  }

  async updateReportTemplate(id: string, templateData: any) {
    return this.request(`/reports/templates`, {
      method: "PUT",
      body: JSON.stringify({ id, ...templateData }),
    })
  }

  async deleteReportTemplate(id: string) {
    return this.request(`/reports/templates?id=${id}`, {
      method: "DELETE",
    })
  }

  async generateReport(templateId: string, parameters: any) {
    return this.request("/reports/generate", {
      method: "POST",
      body: JSON.stringify({ templateId, parameters }),
    })
  }

  async getGeneratedReports(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/reports/generated?${queryParams.toString()}`)
  }

  async downloadReport(reportId: string) {
    return this.request(`/reports/download/${reportId}`)
  }

  async getAnalyticsQueries() {
    return this.request("/reports/analytics/queries")
  }

  async createAnalyticsQuery(queryData: any) {
    return this.request("/reports/analytics/queries", {
      method: "POST",
      body: JSON.stringify(queryData),
    })
  }

  async executeAnalyticsQuery(queryId: string, parameters: any) {
    return this.request("/reports/analytics/execute", {
      method: "POST",
      body: JSON.stringify({ queryId, parameters }),
    })
  }

  // Cache invalidation for reporting data
  invalidateExecutiveDashboard() {
    this.invalidateCache("executive-dashboard")
  }

  invalidateProcurementDashboard() {
    this.invalidateCache("procurement-dashboard")
  }

  invalidateProductionDashboard() {
    this.invalidateCache("production-dashboard")
  }

  invalidateQualityDashboard() {
    this.invalidateCache("quality-dashboard")
  }

  invalidateWarehouseDashboard() {
    this.invalidateCache("warehouse-dashboard")
  }

  invalidateSalesDashboard() {
    this.invalidateCache("sales-dashboard")
  }

  invalidateAuditTrails() {
    this.invalidateCache("audit-trails")
  }

  invalidateReportTemplates() {
    this.invalidateCache("report-templates")
  }

  invalidateGeneratedReports() {
    this.invalidateCache("generated-reports")
  }

  invalidateAnalyticsQueries() {
    this.invalidateCache("analytics-queries")
  }
}

export const apiService = new ApiService()
