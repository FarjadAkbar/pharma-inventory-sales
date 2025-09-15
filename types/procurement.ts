// Procurement Module Types

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  siteId: string
  siteName: string
  expectedDate: string
  status: POStatus
  totalAmount: number
  currency: string
  items: POItem[]
  notes?: string
  createdBy: string
  createdByName: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface POItem {
  id: string
  materialId: string
  materialName: string
  materialCode: string
  quantity: number
  unitId: string
  unitName: string
  unitPrice: number
  totalPrice: number
  receivedQuantity?: number
  pendingQuantity?: number
  status: POItemStatus
}

export interface GoodsReceipt {
  id: string
  grnNumber: string
  poId: string
  poNumber: string
  supplierId: string
  supplierName: string
  siteId: string
  siteName: string
  receivedDate: string
  receivedBy: string
  receivedByName: string
  status: GRNStatus
  items: GRNItem[]
  notes?: string
  coaAttached: boolean
  qcSampleRequested: boolean
  createdAt: string
  updatedAt: string
}

export interface GRNItem {
  id: string
  poItemId: string
  materialId: string
  materialName: string
  materialCode: string
  orderedQuantity: number
  receivedQuantity: number
  unitId: string
  unitName: string
  batchNumber?: string
  expiryDate?: string
  condition: 'Good' | 'Damaged' | 'Expired' | 'Short'
  remarks?: string
  qcSampleRequired: boolean
  qcSampleId?: string
}

export interface QCSampleRequest {
  id: string
  sampleNumber: string
  grnId: string
  grnNumber: string
  materialId: string
  materialName: string
  batchNumber: string
  quantity: number
  unitId: string
  unitName: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected'
  requestedBy: string
  requestedByName: string
  requestedAt: string
  completedBy?: string
  completedByName?: string
  completedAt?: string
  testResults?: QCTestResult[]
}

export interface QCTestResult {
  id: string
  testId: string
  testName: string
  specification: string
  result: string
  unit: string
  passed: boolean
  remarks?: string
  testedBy: string
  testedAt: string
}

export interface Supplier {
  id: string
  name: string
  code: string
  contactPerson: string
  email: string
  phone: string
  address: Address
  rating: number
  deliveryTime: number
  paymentTerms: string
  isActive: boolean
}

export interface Site {
  id: string
  name: string
  code: string
  address: Address
  isActive: boolean
}

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

// Enums
export type POStatus = 
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Partially Received'
  | 'Fully Received'
  | 'Cancelled'
  | 'Rejected'

export type POItemStatus = 
  | 'Pending'
  | 'Partially Received'
  | 'Fully Received'
  | 'Cancelled'

export type GRNStatus = 
  | 'Draft'
  | 'Pending QC'
  | 'QC Approved'
  | 'QC Rejected'
  | 'Completed'
  | 'Cancelled'

// Filter Types
export interface POFilters {
  search?: string
  supplierId?: string
  status?: POStatus
  siteId?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
}

export interface GRNFilters {
  search?: string
  poId?: string
  supplierId?: string
  status?: GRNStatus
  siteId?: string
  dateFrom?: string
  dateTo?: string
}

// API Response Types
export interface ProcurementApiResponse<T> {
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

// Approval Workflow Types
export interface ApprovalAction {
  id: string
  poId: string
  action: 'Approve' | 'Reject'
  comments?: string
  approvedBy: string
  approvedAt: string
}

export interface ApprovalQueue {
  id: string
  poId: string
  poNumber: string
  supplierName: string
  totalAmount: number
  submittedBy: string
  submittedAt: string
  priority: 'High' | 'Medium' | 'Low'
  daysPending: number
}
