// Reporting & Analytics Module Types

export interface ExecutiveDashboard {
  period: string
  kpis: KeyPerformanceIndicators
  trends: TrendAnalysis
  alerts: SystemAlert[]
  systemHealth: SystemHealthMetrics
  compliance: ComplianceMetrics
}

export interface KeyPerformanceIndicators {
  onTimeInFull: number // OTIF percentage
  qualityMetrics: {
    firstPassYield: number
    defectRate: number
    customerComplaints: number
  }
  inventoryTurns: number
  costMetrics: {
    totalRevenue: number
    costOfGoodsSold: number
    grossMargin: number
    operatingExpenses: number
    netProfit: number
  }
  operationalMetrics: {
    orderFulfillmentTime: number
    productionEfficiency: number
    warehouseUtilization: number
    deliveryPerformance: number
  }
}

export interface TrendAnalysis {
  revenue: TrendDataPoint[]
  orders: TrendDataPoint[]
  quality: TrendDataPoint[]
  inventory: TrendDataPoint[]
  costs: TrendDataPoint[]
}

export interface TrendDataPoint {
  date: string
  value: number
  target?: number
  variance?: number
}

export interface SystemAlert {
  id: string
  type: 'Critical' | 'Warning' | 'Info'
  category: 'System' | 'Quality' | 'Inventory' | 'Production' | 'Compliance'
  title: string
  message: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Active' | 'Acknowledged' | 'Resolved' | 'Closed'
  createdAt: string
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedBy?: string
  resolvedAt?: string
  actions: AlertAction[]
}

export interface AlertAction {
  id: string
  action: string
  performedBy: string
  performedAt: string
  result: string
}

export interface SystemHealthMetrics {
  uptime: number
  responseTime: number
  errorRate: number
  activeUsers: number
  dataIntegrity: number
  backupStatus: 'Success' | 'Warning' | 'Failed'
  lastBackup: string
}

export interface ComplianceMetrics {
  gdpCompliance: number
  fdaCompliance: number
  auditReadiness: number
  documentationCompleteness: number
  trainingCompliance: number
  lastAudit: string
  nextAudit: string
  findings: ComplianceFinding[]
}

export interface ComplianceFinding {
  id: string
  category: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  description: string
  dueDate: string
  assignedTo: string
  resolution?: string
}

// Role-Specific Dashboard Types
export interface ProcurementDashboard {
  period: string
  supplierPerformance: SupplierPerformanceMetrics[]
  purchaseOrders: {
    total: number
    pending: number
    approved: number
    received: number
    overdue: number
  }
  costAnalysis: {
    totalSpend: number
    averageOrderValue: number
    costSavings: number
    priceVariance: number
  }
  supplierMetrics: {
    onTimeDelivery: number
    qualityScore: number
    complianceRate: number
  }
  topSuppliers: SupplierSummary[]
  costTrends: TrendDataPoint[]
}

export interface ProductionDashboard {
  period: string
  productionMetrics: {
    totalBatches: number
    completedBatches: number
    inProgressBatches: number
    rejectedBatches: number
    yield: number
  }
  efficiency: {
    overallEfficiency: number
    equipmentUtilization: number
    laborEfficiency: number
    materialEfficiency: number
  }
  quality: {
    firstPassYield: number
    reworkRate: number
    scrapRate: number
    qualityCosts: number
  }
  topProducts: ProductSummary[]
  productionTrends: TrendDataPoint[]
}

export interface QualityDashboard {
  period: string
  testResults: {
    totalTests: number
    passedTests: number
    failedTests: number
    pendingTests: number
    oosResults: number
  }
  deviations: {
    total: number
    open: number
    resolved: number
    critical: number
  }
  capa: {
    total: number
    open: number
    overdue: number
    completed: number
  }
  qualityTrends: TrendDataPoint[]
  topIssues: QualityIssue[]
}

export interface WarehouseDashboard {
  period: string
  inventory: {
    totalItems: number
    totalValue: number
    stockouts: number
    overstock: number
    expiringSoon: number
  }
  operations: {
    putawayTasks: number
    pickTasks: number
    cycleCounts: number
    adjustments: number
  }
  accuracy: {
    inventoryAccuracy: number
    pickAccuracy: number
    putawayAccuracy: number
  }
  topLocations: LocationSummary[]
  inventoryTrends: TrendDataPoint[]
}

export interface SalesDashboard {
  period: string
  sales: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    growthRate: number
  }
  customers: {
    totalCustomers: number
    newCustomers: number
    activeCustomers: number
    customerRetention: number
  }
  products: {
    topProducts: ProductSummary[]
    slowMoving: ProductSummary[]
    outOfStock: ProductSummary[]
  }
  salesTrends: TrendDataPoint[]
  customerSatisfaction: number
}

// Report Generation Types
export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'Financial' | 'Operational' | 'Quality' | 'Compliance' | 'Custom'
  type: 'Scheduled' | 'OnDemand' | 'RealTime'
  format: 'PDF' | 'CSV' | 'Excel' | 'JSON'
  parameters: ReportParameter[]
  schedule?: ReportSchedule
  isActive: boolean
  createdBy: string
  createdAt: string
  lastRun?: string
  nextRun?: string
}

export interface ReportParameter {
  id: string
  name: string
  type: 'Date' | 'Text' | 'Number' | 'Select' | 'MultiSelect'
  required: boolean
  defaultValue?: any
  options?: string[]
  validation?: string
}

export interface ReportSchedule {
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  timezone: string
  recipients: string[]
}

export interface GeneratedReport {
  id: string
  templateId: string
  templateName: string
  generatedBy: string
  generatedAt: string
  status: 'Generating' | 'Completed' | 'Failed'
  format: 'PDF' | 'CSV' | 'Excel' | 'JSON'
  fileSize: number
  downloadUrl: string
  parameters: Record<string, any>
  errorMessage?: string
}

export interface CustomQuery {
  id: string
  name: string
  description: string
  sql: string
  parameters: ReportParameter[]
  createdBy: string
  createdAt: string
  lastModified: string
  isPublic: boolean
  tags: string[]
}

// Audit Trail Types
export interface AuditTrail {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  entityType: string
  entityId: string
  entityName: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  timestamp: string
  ipAddress: string
  userAgent: string
  sessionId: string
  changes: AuditChange[]
}

export interface AuditChange {
  field: string
  oldValue: any
  newValue: any
  changeType: 'Created' | 'Updated' | 'Deleted' | 'Restored'
}

export interface AuditFilters {
  userId?: string
  action?: string
  entityType?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Analytics Types
export interface AnalyticsQuery {
  id: string
  name: string
  description: string
  query: string
  parameters: ReportParameter[]
  visualization: VisualizationConfig
  createdBy: string
  createdAt: string
  isPublic: boolean
  tags: string[]
}

export interface VisualizationConfig {
  type: 'Line' | 'Bar' | 'Pie' | 'Table' | 'Gauge' | 'Heatmap' | 'Scatter'
  title: string
  xAxis?: string
  yAxis?: string
  colorScheme?: string
  showLegend?: boolean
  showDataLabels?: boolean
}

export interface AnalyticsResult {
  queryId: string
  data: any[]
  metadata: {
    totalRows: number
    executionTime: number
    cached: boolean
    generatedAt: string
  }
  visualization?: any
}

// Supporting Types
export interface SupplierPerformanceMetrics {
  supplierId: string
  supplierName: string
  onTimeDelivery: number
  qualityScore: number
  complianceRate: number
  totalOrders: number
  totalValue: number
  averageLeadTime: number
  defectRate: number
}

export interface SupplierSummary {
  id: string
  name: string
  orders: number
  value: number
  performance: number
  trend: 'up' | 'down' | 'stable'
}

export interface ProductSummary {
  id: string
  name: string
  code: string
  quantity: number
  value: number
  trend: 'up' | 'down' | 'stable'
  performance?: number
}

export interface LocationSummary {
  id: string
  name: string
  zone: string
  utilization: number
  items: number
  value: number
  accuracy: number
}

export interface QualityIssue {
  id: string
  category: string
  description: string
  count: number
  trend: 'up' | 'down' | 'stable'
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
}

// Export Types
export interface ExportOptions {
  format: 'CSV' | 'Excel' | 'PDF' | 'JSON'
  includeHeaders: boolean
  dateFormat: string
  numberFormat: string
  filters?: Record<string, any>
  columns?: string[]
}

export interface ExportResult {
  id: string
  status: 'Processing' | 'Completed' | 'Failed'
  downloadUrl?: string
  fileSize?: number
  errorMessage?: string
  createdAt: string
  expiresAt: string
}

// Dashboard Configuration
export interface DashboardConfig {
  id: string
  name: string
  type: 'Executive' | 'Role' | 'Custom'
  role?: string
  widgets: DashboardWidget[]
  layout: DashboardLayout
  refreshInterval: number
  isPublic: boolean
  createdBy: string
  createdAt: string
  lastModified: string
}

export interface DashboardWidget {
  id: string
  type: 'Chart' | 'Table' | 'KPI' | 'Alert' | 'Trend'
  title: string
  dataSource: string
  config: any
  position: { x: number; y: number; w: number; h: number }
  refreshInterval?: number
}

export interface DashboardLayout {
  columns: number
  rows: number
  gap: number
  padding: number
}

// API Response Types
export interface ReportingAPIResponse<T> {
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

// Filter Types
export interface ReportingFilters {
  dateFrom?: string
  dateTo?: string
  period?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
  siteId?: string
  department?: string
  category?: string
  search?: string
}

// Notification Types
export interface ReportNotification {
  id: string
  reportId: string
  reportName: string
  type: 'Scheduled' | 'Alert' | 'Error'
  message: string
  recipients: string[]
  sentAt: string
  status: 'Sent' | 'Failed' | 'Pending'
}

// Performance Metrics
export interface PerformanceMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  availability: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
}
