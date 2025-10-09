"use client"


// Base API Service
export { BaseApiService } from "./base-api.service"

// Individual API Services
import { SitesApiService } from "./sites-api.service"
import { SuppliersApiService } from "./suppliers-api.service"
import { DistributionApiService } from "./distribution-api.service"
import { ManufacturingApiService } from "./manufacturing-api.service"
import { MasterDataApiService } from "./master-data-api.service"
import { ProcurementApiService } from "./procurement-api.service"
import { ProductsApiService } from "./products-api.service"
import { QualityAssuranceApiService } from "./quality-assurance-api.service"
import { QualityControlApiService } from "./quality-control-api.service"
import { ReportingApiService } from "./reporting-api.service"
import { StoresApiService } from "./stores-api.service"
import { UsersApiService } from "./users-api.service"
import { VendorsApiService } from "./vendors-api.service"
import { WarehouseApiService } from "./warehouse-api.service"


// Legacy API Service (for backward compatibility)
export { apiService } from "./api.service"

// Create instances of all API services
export const sitesApi = new SitesApiService()
export const suppliersApi = new SuppliersApiService()
export const usersApi = new UsersApiService()
export const productsApi = new ProductsApiService()
export const vendorsApi = new VendorsApiService()
export const storesApi = new StoresApiService()
export const masterDataApi = new MasterDataApiService()
export const procurementApi = new ProcurementApiService()
export const qualityControlApi = new QualityControlApiService()
export const qualityAssuranceApi = new QualityAssuranceApiService()
export const manufacturingApi = new ManufacturingApiService()
export const warehouseApi = new WarehouseApiService()
export const distributionApi = new DistributionApiService()
export const reportingApi = new ReportingApiService()

// Unified API object for easy access
export const api = {
  sites: sitesApi,
  suppliers: suppliersApi,
  users: usersApi,
  products: productsApi,
  vendors: vendorsApi,
  stores: storesApi,
  masterData: masterDataApi,
  procurement: procurementApi,
  qualityControl: qualityControlApi,
  qualityAssurance: qualityAssuranceApi,
  manufacturing: manufacturingApi,
  warehouse: warehouseApi,
  distribution: distributionApi,
  reporting: reportingApi,
}
