import type { 
  ExecutiveDashboard, 
  ProcurementDashboard, 
  ProductionDashboard, 
  QualityDashboard, 
  WarehouseDashboard, 
  SalesDashboard,
  ReportTemplate,
  GeneratedReport,
  AuditTrail,
  AnalyticsQuery,
  DashboardConfig,
  PerformanceMetrics
} from "@/types/reporting"

// Mock Executive Dashboard Data
export const mockExecutiveDashboard: ExecutiveDashboard = {
  period: "2024-01",
  kpis: {
    onTimeInFull: 95.2,
    qualityMetrics: {
      firstPassYield: 98.5,
      defectRate: 0.8,
      customerComplaints: 2
    },
    inventoryTurns: 12.5,
    costMetrics: {
      totalRevenue: 2500000,
      costOfGoodsSold: 1500000,
      grossMargin: 40.0,
      operatingExpenses: 800000,
      netProfit: 200000
    },
    operationalMetrics: {
      orderFulfillmentTime: 2.5,
      productionEfficiency: 92.3,
      warehouseUtilization: 85.7,
      deliveryPerformance: 96.8
    }
  },
  trends: {
    revenue: [
      { date: "2024-01-01", value: 85000, target: 80000 },
      { date: "2024-01-02", value: 92000, target: 80000 },
      { date: "2024-01-03", value: 78000, target: 80000 },
      { date: "2024-01-04", value: 105000, target: 80000 },
      { date: "2024-01-05", value: 95000, target: 80000 }
    ],
    orders: [
      { date: "2024-01-01", value: 45, target: 40 },
      { date: "2024-01-02", value: 52, target: 40 },
      { date: "2024-01-03", value: 38, target: 40 },
      { date: "2024-01-04", value: 58, target: 40 },
      { date: "2024-01-05", value: 48, target: 40 }
    ],
    quality: [
      { date: "2024-01-01", value: 98.2, target: 95.0 },
      { date: "2024-01-02", value: 98.8, target: 95.0 },
      { date: "2024-01-03", value: 97.5, target: 95.0 },
      { date: "2024-01-04", value: 99.1, target: 95.0 },
      { date: "2024-01-05", value: 98.9, target: 95.0 }
    ],
    inventory: [
      { date: "2024-01-01", value: 1250000, target: 1000000 },
      { date: "2024-01-02", value: 1180000, target: 1000000 },
      { date: "2024-01-03", value: 1320000, target: 1000000 },
      { date: "2024-01-04", value: 1150000, target: 1000000 },
      { date: "2024-01-05", value: 1280000, target: 1000000 }
    ],
    costs: [
      { date: "2024-01-01", value: 45000, target: 50000 },
      { date: "2024-01-02", value: 48000, target: 50000 },
      { date: "2024-01-03", value: 42000, target: 50000 },
      { date: "2024-01-04", value: 52000, target: 50000 },
      { date: "2024-01-05", value: 46000, target: 50000 }
    ]
  },
  alerts: [
    {
      id: "1",
      type: "Warning",
      category: "Quality",
      title: "Temperature Excursion Detected",
      message: "Shipment SHIP-2024-001 experienced temperature excursion above acceptable range",
      severity: "Medium",
      status: "Active",
      createdAt: "2024-01-25T10:30:00Z",
      actions: []
    },
    {
      id: "2",
      type: "Info",
      category: "Inventory",
      title: "Low Stock Alert",
      message: "Paracetamol Tablets stock level below reorder point",
      severity: "Low",
      status: "Acknowledged",
      createdAt: "2024-01-25T09:15:00Z",
      acknowledgedBy: "8",
      acknowledgedAt: "2024-01-25T09:30:00Z",
      actions: [
        {
          id: "1",
          action: "Acknowledged by warehouse manager",
          performedBy: "Mr. Muhammad Ali",
          performedAt: "2024-01-25T09:30:00Z",
          result: "Purchase order will be created"
        }
      ]
    }
  ],
  systemHealth: {
    uptime: 99.9,
    responseTime: 150,
    errorRate: 0.1,
    activeUsers: 45,
    dataIntegrity: 100,
    backupStatus: "Success",
    lastBackup: "2024-01-25T02:00:00Z"
  },
  compliance: {
    gdpCompliance: 98.5,
    fdaCompliance: 99.2,
    auditReadiness: 95.8,
    documentationCompleteness: 97.3,
    trainingCompliance: 96.7,
    lastAudit: "2024-01-15T00:00:00Z",
    nextAudit: "2024-04-15T00:00:00Z",
    findings: [
      {
        id: "1",
        category: "Documentation",
        severity: "Low",
        status: "Open",
        description: "Missing signature on batch record BATCH-001",
        dueDate: "2024-02-01T00:00:00Z",
        assignedTo: "QC Manager"
      }
    ]
  }
}

// Mock Procurement Dashboard Data
export const mockProcurementDashboard: ProcurementDashboard = {
  period: "2024-01",
  supplierPerformance: [
    {
      supplierId: "1",
      supplierName: "MedSupply Ltd",
      onTimeDelivery: 96.5,
      qualityScore: 98.2,
      complianceRate: 99.1,
      totalOrders: 45,
      totalValue: 450000,
      averageLeadTime: 5.2,
      defectRate: 0.3
    },
    {
      supplierId: "2",
      supplierName: "PharmaSource Inc",
      onTimeDelivery: 94.8,
      qualityScore: 97.5,
      complianceRate: 98.7,
      totalOrders: 32,
      totalValue: 320000,
      averageLeadTime: 6.1,
      defectRate: 0.5
    }
  ],
  purchaseOrders: {
    total: 150,
    pending: 12,
    approved: 25,
    received: 98,
    overdue: 3
  },
  costAnalysis: {
    totalSpend: 2500000,
    averageOrderValue: 16666.67,
    costSavings: 125000,
    priceVariance: 2.3
  },
  supplierMetrics: {
    onTimeDelivery: 95.6,
    qualityScore: 97.8,
    complianceRate: 98.9
  },
  topSuppliers: [
    {
      id: "1",
      name: "MedSupply Ltd",
      orders: 45,
      value: 450000,
      performance: 98.2,
      trend: "up"
    },
    {
      id: "2",
      name: "PharmaSource Inc",
      orders: 32,
      value: 320000,
      performance: 97.5,
      trend: "stable"
    }
  ],
  costTrends: [
    { date: "2024-01-01", value: 85000 },
    { date: "2024-01-02", value: 92000 },
    { date: "2024-01-03", value: 78000 },
    { date: "2024-01-04", value: 105000 },
    { date: "2024-01-05", value: 95000 }
  ]
}

// Mock Production Dashboard Data
export const mockProductionDashboard: ProductionDashboard = {
  period: "2024-01",
  productionMetrics: {
    totalBatches: 45,
    completedBatches: 42,
    inProgressBatches: 2,
    rejectedBatches: 1,
    yield: 93.3
  },
  efficiency: {
    overallEfficiency: 92.3,
    equipmentUtilization: 88.7,
    laborEfficiency: 95.2,
    materialEfficiency: 89.8
  },
  quality: {
    firstPassYield: 98.5,
    reworkRate: 1.2,
    scrapRate: 0.3,
    qualityCosts: 15000
  },
  topProducts: [
    {
      id: "1",
      name: "Paracetamol Tablets",
      code: "DRG-001",
      quantity: 100000,
      value: 250000,
      trend: "up",
      performance: 98.5
    },
    {
      id: "2",
      name: "Ibuprofen Tablets",
      code: "DRG-002",
      quantity: 50000,
      value: 150000,
      trend: "stable",
      performance: 97.8
    }
  ],
  productionTrends: [
    { date: "2024-01-01", value: 8 },
    { date: "2024-01-02", value: 9 },
    { date: "2024-01-03", value: 7 },
    { date: "2024-01-04", value: 10 },
    { date: "2024-01-05", value: 8 }
  ]
}

// Mock Quality Dashboard Data
export const mockQualityDashboard: QualityDashboard = {
  period: "2024-01",
  testResults: {
    totalTests: 250,
    passedTests: 245,
    failedTests: 3,
    pendingTests: 2,
    oosResults: 1
  },
  deviations: {
    total: 12,
    open: 3,
    resolved: 8,
    critical: 1
  },
  capa: {
    total: 8,
    open: 2,
    overdue: 1,
    completed: 5
  },
  qualityTrends: [
    { date: "2024-01-01", value: 98.2 },
    { date: "2024-01-02", value: 98.8 },
    { date: "2024-01-03", value: 97.5 },
    { date: "2024-01-04", value: 99.1 },
    { date: "2024-01-05", value: 98.9 }
  ],
  topIssues: [
    {
      id: "1",
      category: "Temperature Control",
      description: "Temperature excursions during storage",
      count: 3,
      trend: "down",
      severity: "Medium"
    },
    {
      id: "2",
      category: "Documentation",
      description: "Missing batch signatures",
      count: 2,
      trend: "stable",
      severity: "Low"
    }
  ]
}

// Mock Warehouse Dashboard Data
export const mockWarehouseDashboard: WarehouseDashboard = {
  period: "2024-01",
  inventory: {
    totalItems: 1250,
    totalValue: 2500000,
    stockouts: 5,
    overstock: 12,
    expiringSoon: 8
  },
  operations: {
    putawayTasks: 45,
    pickTasks: 120,
    cycleCounts: 25,
    adjustments: 3
  },
  accuracy: {
    inventoryAccuracy: 99.2,
    pickAccuracy: 98.7,
    putawayAccuracy: 99.5
  },
  topLocations: [
    {
      id: "1",
      name: "A-01-01-01",
      zone: "A",
      utilization: 95.2,
      items: 45,
      value: 125000,
      accuracy: 99.5
    },
    {
      id: "2",
      name: "B-02-03-01",
      zone: "B",
      utilization: 88.7,
      items: 38,
      value: 98000,
      accuracy: 98.9
    }
  ],
  inventoryTrends: [
    { date: "2024-01-01", value: 1250000 },
    { date: "2024-01-02", value: 1180000 },
    { date: "2024-01-03", value: 1320000 },
    { date: "2024-01-04", value: 1150000 },
    { date: "2024-01-05", value: 1280000 }
  ]
}

// Mock Sales Dashboard Data
export const mockSalesDashboard: SalesDashboard = {
  period: "2024-01",
  sales: {
    totalRevenue: 2500000,
    totalOrders: 150,
    averageOrderValue: 16666.67,
    growthRate: 12.5
  },
  customers: {
    totalCustomers: 25,
    newCustomers: 3,
    activeCustomers: 22,
    customerRetention: 95.8
  },
  products: {
    topProducts: [
      {
        id: "1",
        name: "Paracetamol Tablets",
        code: "DRG-001",
        quantity: 50000,
        value: 125000,
        trend: "up"
      },
      {
        id: "2",
        name: "Ibuprofen Tablets",
        code: "DRG-002",
        quantity: 25000,
        value: 125000,
        trend: "stable"
      }
    ],
    slowMoving: [
      {
        id: "3",
        name: "Aspirin Tablets",
        code: "DRG-003",
        quantity: 5000,
        value: 15000,
        trend: "down"
      }
    ],
    outOfStock: [
      {
        id: "4",
        name: "Vitamin C Tablets",
        code: "DRG-004",
        quantity: 0,
        value: 0,
        trend: "down"
      }
    ]
  },
  salesTrends: [
    { date: "2024-01-01", value: 85000 },
    { date: "2024-01-02", value: 92000 },
    { date: "2024-01-03", value: 78000 },
    { date: "2024-01-04", value: 105000 },
    { date: "2024-01-05", value: 95000 }
  ],
  customerSatisfaction: 4.6
}

// Mock Report Templates
export const mockReportTemplates: ReportTemplate[] = [
  {
    id: "1",
    name: "Monthly Sales Report",
    description: "Comprehensive monthly sales analysis with revenue and customer metrics",
    category: "Financial",
    type: "Scheduled",
    format: "PDF",
    parameters: [
      {
        id: "1",
        name: "Month",
        type: "Select",
        required: true,
        options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      },
      {
        id: "2",
        name: "Year",
        type: "Number",
        required: true,
        defaultValue: 2024
      }
    ],
    schedule: {
      frequency: "Monthly",
      dayOfMonth: 1,
      time: "09:00",
      timezone: "UTC",
      recipients: ["executive@ziauddin.edu.pk", "sales@ziauddin.edu.pk"]
    },
    isActive: true,
    createdBy: "1",
    createdAt: "2024-01-01T00:00:00Z",
    lastRun: "2024-01-01T09:00:00Z",
    nextRun: "2024-02-01T09:00:00Z"
  },
  {
    id: "2",
    name: "Quality Control Summary",
    description: "Weekly quality control test results and deviation summary",
    category: "Quality",
    type: "Scheduled",
    format: "Excel",
    parameters: [
      {
        id: "1",
        name: "Week",
        type: "Date",
        required: true
      }
    ],
    schedule: {
      frequency: "Weekly",
      dayOfWeek: 1,
      time: "08:00",
      timezone: "UTC",
      recipients: ["qc@ziauddin.edu.pk", "qa@ziauddin.edu.pk"]
    },
    isActive: true,
    createdBy: "2",
    createdAt: "2024-01-01T00:00:00Z",
    lastRun: "2024-01-22T08:00:00Z",
    nextRun: "2024-01-29T08:00:00Z"
  }
]

// Mock Generated Reports
export const mockGeneratedReports: GeneratedReport[] = [
  {
    id: "1",
    templateId: "1",
    templateName: "Monthly Sales Report",
    generatedBy: "1",
    generatedAt: "2024-01-01T09:00:00Z",
    status: "Completed",
    format: "PDF",
    fileSize: 2048000,
    downloadUrl: "/reports/monthly-sales-2024-01.pdf",
    parameters: {
      Month: "January",
      Year: 2024
    }
  },
  {
    id: "2",
    templateId: "2",
    templateName: "Quality Control Summary",
    generatedBy: "2",
    generatedAt: "2024-01-22T08:00:00Z",
    status: "Completed",
    format: "Excel",
    fileSize: 1024000,
    downloadUrl: "/reports/qc-summary-2024-w04.xlsx",
    parameters: {
      Week: "2024-01-22"
    }
  }
]

// Mock Audit Trail Data
export const mockAuditTrails: AuditTrail[] = [
  {
    id: "1",
    userId: "1",
    userName: "System Admin",
    userRole: "system_admin",
    action: "CREATE",
    entityType: "SalesOrder",
    entityId: "1",
    entityName: "SO-2024-001",
    timestamp: "2024-01-24T09:00:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionId: "sess_123456789",
    changes: [
      {
        field: "status",
        oldValue: null,
        newValue: "Draft",
        changeType: "Created"
      }
    ]
  },
  {
    id: "2",
    userId: "2",
    userName: "Ms. Ayesha Khan",
    userRole: "org_admin",
    action: "UPDATE",
    entityType: "SalesOrder",
    entityId: "1",
    entityName: "SO-2024-001",
    oldValues: { status: "Draft" },
    newValues: { status: "Approved" },
    timestamp: "2024-01-24T10:30:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionId: "sess_123456790",
    changes: [
      {
        field: "status",
        oldValue: "Draft",
        newValue: "Approved",
        changeType: "Updated"
      }
    ]
  }
]

// Mock Analytics Queries
export const mockAnalyticsQueries: AnalyticsQuery[] = [
  {
    id: "1",
    name: "Sales Trend Analysis",
    description: "Analyze sales trends over time with revenue and order volume",
    query: "SELECT date, SUM(revenue) as revenue, COUNT(orders) as orders FROM sales GROUP BY date ORDER BY date",
    parameters: [
      {
        id: "1",
        name: "Date Range",
        type: "Date",
        required: true
      }
    ],
    visualization: {
      type: "Line",
      title: "Sales Trends",
      xAxis: "date",
      yAxis: "revenue",
      colorScheme: "blue",
      showLegend: true,
      showDataLabels: false
    },
    createdBy: "1",
    createdAt: "2024-01-01T00:00:00Z",
    isPublic: true,
    tags: ["sales", "trends", "revenue"]
  }
]

// Mock Dashboard Configurations
export const mockDashboardConfigs: DashboardConfig[] = [
  {
    id: "1",
    name: "Executive Dashboard",
    type: "Executive",
    widgets: [
      {
        id: "1",
        type: "KPI",
        title: "OTIF Performance",
        dataSource: "kpis.onTimeInFull",
        config: { format: "percentage", color: "green" },
        position: { x: 0, y: 0, w: 3, h: 2 }
      },
      {
        id: "2",
        type: "Chart",
        title: "Revenue Trends",
        dataSource: "trends.revenue",
        config: { type: "line", showTarget: true },
        position: { x: 3, y: 0, w: 6, h: 4 }
      }
    ],
    layout: {
      columns: 12,
      rows: 8,
      gap: 16,
      padding: 16
    },
    refreshInterval: 300000,
    isPublic: false,
    createdBy: "1",
    createdAt: "2024-01-01T00:00:00Z",
    lastModified: "2024-01-25T00:00:00Z"
  }
]

// Mock Performance Metrics
export const mockPerformanceMetrics: PerformanceMetrics = {
  responseTime: 150,
  throughput: 1000,
  errorRate: 0.1,
  availability: 99.9,
  cpuUsage: 45.2,
  memoryUsage: 67.8,
  diskUsage: 23.5,
  networkLatency: 25
}
