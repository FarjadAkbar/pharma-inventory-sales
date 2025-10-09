"use client"

import { BaseApiService } from "./base-api.service"

export class ReportingApiService extends BaseApiService {
  // Dashboard APIs
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

  // Audit Trails API
  async getAuditTrails(filters: any = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })
    return this.request(`/reports/audit?${queryParams.toString()}`)
  }

  // Report Templates API
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

  // Report Generation API
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

  // Analytics Queries API
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
