// Manufacturing Module Types

export interface BOM {
  id: string
  bomNumber: string
  drugId: string
  drugName: string
  drugCode: string
  version: number
  status: BOMStatus
  description: string
  items: BOMItem[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  effectiveDate?: string
  expiryDate?: string
  remarks?: string
}

export interface BOMItem {
  id: string
  materialId: string
  materialName: string
  materialCode: string
  quantityPerBatch: number
  unit: string
  tolerance: number
  isCritical: boolean
  sequence: number
  remarks?: string
}

export interface WorkOrder {
  id: string
  workOrderNumber: string
  drugId: string
  drugName: string
  drugCode: string
  siteId: string
  siteName: string
  plannedQuantity: number
  unit: string
  bomVersion: number
  status: WorkOrderStatus
  priority: ManufacturingPriority
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  assignedTo: string
  assignedToName: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  remarks?: string
}

export interface Batch {
  id: string
  batchNumber: string
  workOrderId: string
  workOrderNumber: string
  drugId: string
  drugName: string
  drugCode: string
  siteId: string
  siteName: string
  plannedQuantity: number
  actualQuantity?: number
  unit: string
  bomVersion: number
  status: BatchStatus
  priority: ManufacturingPriority
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  startedBy?: string
  startedByName?: string
  startedAt?: string
  completedBy?: string
  completedByName?: string
  completedAt?: string
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  remarks?: string
}

export interface BatchStep {
  id: string
  stepNumber: number
  instruction: string
  description: string
  parameters: Record<string, any>
  status: BatchStepStatus
  performedBy?: string
  performedByName?: string
  performedAt?: string
  eSignature?: string
  remarks?: string
  attachments: ManufacturingAttachment[]
}

export interface ElectronicBatchRecord {
  id: string
  batchId: string
  batchNumber: string
  drugId: string
  drugName: string
  drugCode: string
  siteId: string
  siteName: string
  status: EBRStatus
  steps: BatchStep[]
  materialConsumption: MaterialConsumption[]
  qualityChecks: QualityCheck[]
  environmentalConditions: EnvironmentalCondition[]
  equipmentUsed: EquipmentUsed[]
  personnel: PersonnelRecord[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
}

export interface MaterialConsumption {
  id: string
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  plannedQuantity: number
  actualQuantity: number
  unit: string
  consumedAt: string
  consumedBy: string
  consumedByName: string
  location: string
  remarks?: string
}

export interface QualityCheck {
  id: string
  checkType: string
  parameter: string
  specification: string
  result: string
  unit: string
  passed: boolean
  checkedAt: string
  checkedBy: string
  checkedByName: string
  remarks?: string
}

export interface EnvironmentalCondition {
  id: string
  parameter: string
  value: number
  unit: string
  recordedAt: string
  recordedBy: string
  recordedByName: string
  remarks?: string
}

export interface EquipmentUsed {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentCode: string
  usedFrom: string
  usedTo: string
  usedBy: string
  usedByName: string
  remarks?: string
}

export interface PersonnelRecord {
  id: string
  personnelId: string
  personnelName: string
  role: string
  shift: string
  startTime: string
  endTime: string
  remarks?: string
}

export interface ManufacturingAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  url: string
  category: 'Document' | 'Image' | 'Certificate' | 'Report' | 'Photo'
}

export interface ProductionSite {
  id: string
  name: string
  code: string
  location: string
  type: 'Manufacturing' | 'Packaging' | 'Both'
  capacity: number
  unit: string
  isActive: boolean
  equipment: ProductionEquipment[]
}

export interface ProductionEquipment {
  id: string
  name: string
  code: string
  type: string
  model: string
  serialNumber: string
  status: 'Active' | 'Maintenance' | 'Out of Service'
  lastCalibration?: string
  nextCalibration?: string
  capacity?: number
  unit?: string
}

export interface ProductionPersonnel {
  id: string
  name: string
  email: string
  role: string
  certifications: string[]
  isActive: boolean
  currentWorkload: number
  maxWorkload: number
}

// Enums
export type BOMStatus = 
  | 'Draft'
  | 'Under Review'
  | 'Approved'
  | 'Active'
  | 'Obsolete'

export type WorkOrderStatus = 
  | 'Draft'
  | 'Planned'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled'

export type BatchStatus = 
  | 'Draft'
  | 'Planned'
  | 'In Progress'
  | 'QC Pending'
  | 'QA Pending'
  | 'Completed'
  | 'Cancelled'
  | 'Failed'

export type BatchStepStatus = 
  | 'Pending'
  | 'In Progress'
  | 'Completed'
  | 'Skipped'
  | 'Failed'

export type EBRStatus = 
  | 'Draft'
  | 'In Progress'
  | 'QC Pending'
  | 'QA Pending'
  | 'Completed'
  | 'Approved'
  | 'Rejected'

export type ManufacturingPriority = 
  | 'Low'
  | 'Normal'
  | 'High'
  | 'Urgent'

// Filter Types
export interface BOMFilters {
  search?: string
  drugId?: string
  status?: BOMStatus
  version?: number
  createdBy?: string
  dateFrom?: string
  dateTo?: string
}

export interface WorkOrderFilters {
  search?: string
  drugId?: string
  siteId?: string
  status?: WorkOrderStatus
  priority?: ManufacturingPriority
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
}

export interface BatchFilters {
  search?: string
  drugId?: string
  siteId?: string
  status?: BatchStatus
  priority?: ManufacturingPriority
  createdBy?: string
  dateFrom?: string
  dateTo?: string
}

// API Response Types
export interface ManufacturingAPIResponse<T> {
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

// Dashboard Statistics
export interface ManufacturingDashboardStats {
  totalBOMs: number
  activeBOMs: number
  totalWorkOrders: number
  plannedWorkOrders: number
  inProgressWorkOrders: number
  completedWorkOrders: number
  totalBatches: number
  inProgressBatches: number
  qcPendingBatches: number
  qaPendingBatches: number
  completedBatches: number
  averageProductionTime: number
  yieldRate: number
}

// Production Planning
export interface ProductionPlan {
  id: string
  planNumber: string
  drugId: string
  drugName: string
  drugCode: string
  plannedQuantity: number
  unit: string
  plannedStartDate: string
  plannedEndDate: string
  siteId: string
  siteName: string
  status: 'Draft' | 'Approved' | 'In Progress' | 'Completed'
  createdBy: string
  createdByName: string
  createdAt: string
  workOrders: WorkOrder[]
}

// Material Requirements Planning (MRP)
export interface MRPItem {
  id: string
  materialId: string
  materialName: string
  materialCode: string
  requiredQuantity: number
  availableQuantity: number
  shortfall: number
  unit: string
  requiredDate: string
  supplierId?: string
  supplierName?: string
  status: 'Available' | 'Shortage' | 'Ordered' | 'Received'
}

export interface MRPPlan {
  id: string
  planNumber: string
  workOrderId: string
  workOrderNumber: string
  drugId: string
  drugName: string
  drugCode: string
  plannedStartDate: string
  items: MRPItem[]
  status: 'Draft' | 'Generated' | 'Approved' | 'Executed'
  createdBy: string
  createdByName: string
  createdAt: string
}
