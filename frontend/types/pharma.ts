// Pharmaceutical Master Data Types

export interface Drug {
  id: string
  code: string
  name: string
  formula: string
  strength: string
  dosageForm: DosageForm
  route: Route
  description: string
  approvalStatus: ApprovalStatus
  therapeuticClass?: string
  manufacturer?: string
  registrationNumber?: string
  expiryDate?: string
  storageConditions?: StorageCondition[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface RawMaterial {
  id: string
  code: string
  name: string
  grade: string
  specification: string
  unit: string
  supplierId: string
  supplierName: string
  storageRequirements: StorageCondition[]
  shelfLife?: number // in days
  minOrderQuantity: number
  maxOrderQuantity?: number
  currentStock: number
  reorderLevel: number
  costPerUnit: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Supplier {
  id: string
  code: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: Address
  rating: number // 1-5 stars
  performance: SupplierPerformance
  certifications: string[]
  paymentTerms: string
  deliveryTime: number // in days
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface SupplierPerformance {
  onTimeDelivery: number // percentage
  qualityScore: number // 1-5
  responseTime: number // in hours
  totalOrders: number
  successfulOrders: number
  lastOrderDate?: string
}

export interface StorageCondition {
  type: 'temperature' | 'humidity' | 'light' | 'special'
  minValue?: number
  maxValue?: number
  unit: string
  description: string
}

// Enums
export type DosageForm = 
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Injection'
  | 'Ointment'
  | 'Cream'
  | 'Drops'
  | 'Powder'
  | 'Suspension'
  | 'Patch'
  | 'Inhaler'

export type Route = 
  | 'Oral'
  | 'IV'
  | 'IM'
  | 'SC'
  | 'Topical'
  | 'Inhalation'
  | 'Rectal'
  | 'Vaginal'
  | 'Ophthalmic'
  | 'Otic'
  | 'Nasal'

export type ApprovalStatus = 
  | 'Draft'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Under Review'

// API Response Types
export interface PharmaApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter and Search Types
export interface DrugFilters {
  search?: string
  dosageForm?: DosageForm
  route?: Route
  approvalStatus?: ApprovalStatus
  therapeuticClass?: string
  manufacturer?: string
}

export interface RawMaterialFilters {
  search?: string
  grade?: string
  supplierId?: string
  isActive?: boolean
  lowStock?: boolean
}

export interface SupplierFilters {
  search?: string
  rating?: number
  isActive?: boolean
  performance?: 'excellent' | 'good' | 'average' | 'poor'
}
