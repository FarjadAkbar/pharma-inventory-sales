// Quality Assurance Module Types

export interface QARelease {
  id: string
  releaseNumber: string
  entityType: 'ReceiptItem' | 'Batch' | 'Sample'
  entityId: string
  entityReference: string
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  quantity: number
  unit: string
  sourceType: 'GRN' | 'Production' | 'Stability'
  sourceId: string
  sourceReference: string
  status: QAReleaseStatus
  priority: QAPriority
  qcResults: QCResultSummary[]
  decision: QADecision
  decisionReason?: string
  checklistItems: QAChecklistItem[]
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
  eSignature?: string
  submittedBy: string
  submittedByName: string
  submittedAt: string
  dueDate?: string
  completedAt?: string
  remarks?: string
}

export interface QCResultSummary {
  id: string
  testId: string
  testName: string
  testCode: string
  parameter: string
  resultValue: string
  unit: string
  specification: string
  passed: boolean
  deviation?: number
  testedBy: string
  testedByName: string
  testedAt: string
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
}

export interface QAChecklistItem {
  id: string
  item: string
  description: string
  category: QAChecklistCategory
  checked: boolean
  remarks?: string
  checkedBy?: string
  checkedByName?: string
  checkedAt?: string
  isRequired: boolean
}

export interface QADeviation {
  id: string
  deviationNumber: string
  title: string
  description: string
  severity: DeviationSeverity
  category: DeviationCategory
  status: DeviationStatus
  sourceType: 'QC' | 'Production' | 'Warehouse' | 'Distribution' | 'Customer'
  sourceId: string
  sourceReference: string
  materialId?: string
  materialName?: string
  batchNumber?: string
  discoveredBy: string
  discoveredByName: string
  discoveredAt: string
  assignedTo?: string
  assignedToName?: string
  assignedAt?: string
  dueDate?: string
  closedAt?: string
  rootCause?: string
  immediateAction?: string
  correctiveAction?: string
  preventiveAction?: string
  effectivenessCheck?: string
  attachments: QAAttachment[]
  timeline: QATimelineEvent[]
}

export interface QATimelineEvent {
  id: string
  event: string
  description: string
  performedBy: string
  performedByName: string
  performedAt: string
  status: string
}

export interface QACAPA {
  id: string
  capaNumber: string
  title: string
  description: string
  type: CAPAType
  status: CAPAStatus
  priority: QAPriority
  deviationId?: string
  deviationNumber?: string
  rootCause: string
  immediateAction: string
  correctiveAction: string
  preventiveAction: string
  effectivenessCheck: string
  assignedTo: string
  assignedToName: string
  assignedAt: string
  dueDate: string
  completedAt?: string
  effectivenessVerified?: boolean
  verifiedBy?: string
  verifiedByName?: string
  verifiedAt?: string
  attachments: QAAttachment[]
  timeline: QATimelineEvent[]
}

export interface QAAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  url: string
  category: 'Document' | 'Image' | 'Certificate' | 'Report'
}

export interface QAAuditTrail {
  id: string
  entityType: string
  entityId: string
  action: string
  description: string
  performedBy: string
  performedByName: string
  performedAt: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export interface QAComplianceReport {
  id: string
  reportNumber: string
  title: string
  type: ComplianceReportType
  period: {
    startDate: string
    endDate: string
  }
  status: 'Draft' | 'Under Review' | 'Approved' | 'Published'
  generatedBy: string
  generatedByName: string
  generatedAt: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  metrics: QAComplianceMetrics
  findings: QAComplianceFinding[]
  recommendations: string[]
  attachments: QAAttachment[]
}

export interface QAComplianceMetrics {
  totalDeviations: number
  openDeviations: number
  closedDeviations: number
  overdueDeviations: number
  totalCAPAs: number
  openCAPAs: number
  closedCAPAs: number
  overdueCAPAs: number
  complianceScore: number
  trend: 'Improving' | 'Stable' | 'Declining'
}

export interface QAComplianceFinding {
  id: string
  category: string
  description: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed'
  assignedTo?: string
  assignedToName?: string
  dueDate?: string
  resolution?: string
}

// Enums
export type QAReleaseStatus = 
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'On Hold'
  | 'Completed'

export type QADecision = 
  | 'Release'
  | 'Reject'
  | 'Hold'
  | 'Pending'

export type QAPriority = 
  | 'Low'
  | 'Normal'
  | 'High'
  | 'Urgent'

export type QAChecklistCategory = 
  | 'Documentation'
  | 'Testing'
  | 'Compliance'
  | 'Traceability'
  | 'Storage'
  | 'Handling'

export type DeviationSeverity = 
  | 'Minor'
  | 'Major'
  | 'Critical'

export type DeviationCategory = 
  | 'Quality'
  | 'Safety'
  | 'Compliance'
  | 'Process'
  | 'Documentation'
  | 'Equipment'

export type DeviationStatus = 
  | 'Open'
  | 'Under Investigation'
  | 'Root Cause Identified'
  | 'CAPA In Progress'
  | 'Resolved'
  | 'Closed'

export type CAPAType = 
  | 'Corrective Action'
  | 'Preventive Action'
  | 'Both'

export type CAPAStatus = 
  | 'Open'
  | 'In Progress'
  | 'Under Review'
  | 'Completed'
  | 'Verified'
  | 'Closed'

export type ComplianceReportType = 
  | 'Monthly'
  | 'Quarterly'
  | 'Annual'
  | 'Ad-hoc'

// Filter Types
export interface QAReleaseFilters {
  search?: string
  entityType?: string
  status?: QAReleaseStatus
  priority?: QAPriority
  reviewedBy?: string
  dateFrom?: string
  dateTo?: string
}

export interface QADeviationFilters {
  search?: string
  severity?: DeviationSeverity
  category?: DeviationCategory
  status?: DeviationStatus
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
}

export interface QACAPAFilters {
  search?: string
  type?: CAPAType
  status?: CAPAStatus
  priority?: QAPriority
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
}

// API Response Types
export interface QAAPIResponse<T> {
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
export interface QADashboardStats {
  totalReleases: number
  pendingReleases: number
  approvedReleases: number
  rejectedReleases: number
  onHoldReleases: number
  totalDeviations: number
  openDeviations: number
  closedDeviations: number
  overdueDeviations: number
  totalCAPAs: number
  openCAPAs: number
  closedCAPAs: number
  overdueCAPAs: number
  averageResolutionTime: number
  complianceScore: number
}

// Electronic Signature
export interface QAElectronicSignature {
  id: string
  entityType: string
  entityId: string
  action: string
  signature: string
  signedBy: string
  signedByName: string
  signedAt: string
  ipAddress: string
  userAgent: string
  certificate?: string
  hash: string
}
