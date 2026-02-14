// Quality Control Module Types

export interface QCTest {
  id?: string | number
  code?: string
  name: string
  description?: string
  category?: QCTestCategory
  specifications: QCTestSpecification[]
  status: 'Active' | 'Inactive'
  createdAt?: string | Date
  updatedAt?: string | Date
  // Legacy fields for backward compatibility (not sent to backend)
  method?: string
  unit?: string
  isActive?: boolean
  equipmentRequired?: string
  duration?: string
  temperature?: string
  notes?: string
  createdById?: string
  createdByName?: string
  createdBy?: string
}

export interface QCTestSpecification {
  id?: string | number
  parameter: string
  minValue?: string
  maxValue?: string
  targetValue?: string
  unit: string
  method?: string
  // Legacy fields for backward compatibility (not sent to backend)
  specification?: string
  type?: string
  description?: string
  criteria?: string
  isRequired?: boolean
}

export interface QCSample {
  id: string
  sampleCode: string
  sourceType: 'GRN' | 'Batch' | 'Production' | 'Stability'
  sourceId: string
  sourceReference: string
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  quantity: number
  unit: string
  priority: QCPriority
  status: QCSampleStatus
  assignedTo?: string
  assignedToName?: string
  requestedBy: string
  requestedByName: string
  requestedAt: string
  dueDate?: string
  completedAt?: string
  tests: QCSampleTest[]
  remarks?: string
}

export interface QCSampleTest {
  id: string
  testId: string
  testName: string
  testCode: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
  assignedTo?: string
  assignedToName?: string
  startedAt?: string
  completedAt?: string
  result?: QCTestResult
}

export interface QCTestResult {
  id: string
  testId: string
  sampleId: string
  sampleTestId: string
  parameter: string
  resultValue: string
  unit: string
  specification: QCTestSpecification
  passed: boolean
  deviation?: number
  remarks?: string
  testedBy: string
  testedByName: string
  testedAt: string
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
  attachments?: QCResultAttachment[]
}

export interface QCResultAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedAt: string
  url: string
}

export interface QCAnalyst {
  id: string
  name: string
  email: string
  specialization: string[]
  certifications: string[]
  isActive: boolean
  currentWorkload: number
  maxWorkload: number
}

export interface QCLab {
  id: string
  name: string
  code: string
  location: string
  equipment: QCEquipment[]
  isActive: boolean
}

export interface QCEquipment {
  id: string
  name: string
  model: string
  serialNumber: string
  calibrationDate: string
  nextCalibrationDate: string
  status: 'Active' | 'Maintenance' | 'Out of Service'
}

// Enums
export type QCTestCategory = 
  | 'Physical'
  | 'Chemical'
  | 'Microbiological'
  | 'Stability'
  | 'Dissolution'
  | 'Content Uniformity'
  | 'Assay'
  | 'Impurities'
  | 'Identification'

export type QCPriority = 
  | 'Low'
  | 'Normal'
  | 'High'
  | 'Urgent'

export type QCSampleStatus = 
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'

// Filter Types
export interface QCTestFilters {
  search?: string
  category?: QCTestCategory
  isActive?: boolean
}

export interface QCSampleFilters {
  search?: string
  sourceType?: string
  status?: QCSampleStatus
  priority?: QCPriority
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
}

// API Response Types
export interface QCAPIResponse<T> {
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
export interface QCDashboardStats {
  totalSamples: number
  pendingSamples: number
  inProgressSamples: number
  completedSamples: number
  overdueSamples: number
  totalTests: number
  passedTests: number
  failedTests: number
  averageTurnaroundTime: number
}

// Workflow Types
export interface QCWorkflowStep {
  id: string
  name: string
  description: string
  order: number
  isRequired: boolean
  estimatedTime: number // in hours
  assignedRole: string
}

export interface QCWorkflow {
  id: string
  name: string
  description: string
  steps: QCWorkflowStep[]
  isActive: boolean
}

// OOS (Out of Specification) Management
export interface OOSInvestigation {
  id: string
  sampleId: string
  testId: string
  resultId: string
  deviation: number
  severity: 'Minor' | 'Major' | 'Critical'
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed'
  assignedTo: string
  assignedToName: string
  openedAt: string
  closedAt?: string
  rootCause?: string
  correctiveAction?: string
  preventiveAction?: string
}
