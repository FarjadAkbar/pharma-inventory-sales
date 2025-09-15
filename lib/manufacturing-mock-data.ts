import type { BOM, WorkOrder, Batch, ElectronicBatchRecord, ProductionSite, ManufacturingDashboardStats, BOMItem, BatchStep, MaterialConsumption } from "@/types/manufacturing"

// Mock BOMs Data
export const mockBOMs: BOM[] = [
  {
    id: "1",
    bomNumber: "BOM-001",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    drugCode: "DRG-001",
    version: 1,
    status: "Active",
    description: "Bill of Materials for Paracetamol 500mg Tablets",
    items: [
      {
        id: "1",
        materialId: "1",
        materialName: "Paracetamol API",
        materialCode: "RM-001",
        quantityPerBatch: 50.0,
        unit: "kg",
        tolerance: 2.0,
        isCritical: true,
        sequence: 1,
        remarks: "Active pharmaceutical ingredient"
      },
      {
        id: "2",
        materialId: "2",
        materialName: "Microcrystalline Cellulose",
        materialCode: "RM-002",
        quantityPerBatch: 25.0,
        unit: "kg",
        tolerance: 5.0,
        isCritical: false,
        sequence: 2,
        remarks: "Diluent"
      },
      {
        id: "3",
        materialId: "3",
        materialName: "Sodium Starch Glycolate",
        materialCode: "RM-003",
        quantityPerBatch: 2.5,
        unit: "kg",
        tolerance: 10.0,
        isCritical: false,
        sequence: 3,
        remarks: "Disintegrant"
      },
      {
        id: "4",
        materialId: "4",
        materialName: "Magnesium Stearate",
        materialCode: "RM-004",
        quantityPerBatch: 0.5,
        unit: "kg",
        tolerance: 20.0,
        isCritical: false,
        sequence: 4,
        remarks: "Lubricant"
      }
    ],
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    approvedBy: "7",
    approvedByName: "Dr. Sarah Ahmed",
    approvedAt: "2024-01-02T00:00:00Z",
    effectiveDate: "2024-01-02T00:00:00Z",
    remarks: "Standard BOM for Paracetamol tablets"
  },
  {
    id: "2",
    bomNumber: "BOM-002",
    drugId: "2",
    drugName: "Ibuprofen Tablets",
    drugCode: "DRG-002",
    version: 1,
    status: "Active",
    description: "Bill of Materials for Ibuprofen 400mg Tablets",
    items: [
      {
        id: "5",
        materialId: "5",
        materialName: "Ibuprofen API",
        materialCode: "RM-005",
        quantityPerBatch: 40.0,
        unit: "kg",
        tolerance: 2.0,
        isCritical: true,
        sequence: 1,
        remarks: "Active pharmaceutical ingredient"
      },
      {
        id: "6",
        materialId: "2",
        materialName: "Microcrystalline Cellulose",
        materialCode: "RM-002",
        quantityPerBatch: 30.0,
        unit: "kg",
        tolerance: 5.0,
        isCritical: false,
        sequence: 2,
        remarks: "Diluent"
      },
      {
        id: "7",
        materialId: "3",
        materialName: "Sodium Starch Glycolate",
        materialCode: "RM-003",
        quantityPerBatch: 3.0,
        unit: "kg",
        tolerance: 10.0,
        isCritical: false,
        sequence: 3,
        remarks: "Disintegrant"
      },
      {
        id: "8",
        materialId: "4",
        materialName: "Magnesium Stearate",
        materialCode: "RM-004",
        quantityPerBatch: 0.6,
        unit: "kg",
        tolerance: 20.0,
        isCritical: false,
        sequence: 4,
        remarks: "Lubricant"
      }
    ],
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    approvedBy: "7",
    approvedByName: "Dr. Sarah Ahmed",
    approvedAt: "2024-01-02T00:00:00Z",
    effectiveDate: "2024-01-02T00:00:00Z",
    remarks: "Standard BOM for Ibuprofen tablets"
  }
]

// Mock Work Orders Data
export const mockWorkOrders: WorkOrder[] = [
  {
    id: "1",
    workOrderNumber: "WO-001",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    drugCode: "DRG-001",
    siteId: "1",
    siteName: "Main Production Facility",
    plannedQuantity: 100000,
    unit: "tablets",
    bomVersion: 1,
    status: "In Progress",
    priority: "High",
    plannedStartDate: "2024-01-25T08:00:00Z",
    plannedEndDate: "2024-01-26T18:00:00Z",
    actualStartDate: "2024-01-25T08:30:00Z",
    assignedTo: "6",
    assignedToName: "Mr. Hassan Ali",
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-24T10:00:00Z",
    updatedAt: "2024-01-25T08:30:00Z",
    remarks: "Urgent production order for hospital supply"
  },
  {
    id: "2",
    workOrderNumber: "WO-002",
    drugId: "2",
    drugName: "Ibuprofen Tablets",
    drugCode: "DRG-002",
    siteId: "1",
    siteName: "Main Production Facility",
    plannedQuantity: 50000,
    unit: "tablets",
    bomVersion: 1,
    status: "Planned",
    priority: "Normal",
    plannedStartDate: "2024-01-27T08:00:00Z",
    plannedEndDate: "2024-01-28T18:00:00Z",
    assignedTo: "6",
    assignedToName: "Mr. Hassan Ali",
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-24T10:00:00Z",
    updatedAt: "2024-01-24T10:00:00Z",
    remarks: "Regular production order"
  },
  {
    id: "3",
    workOrderNumber: "WO-003",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    drugCode: "DRG-001",
    siteId: "2",
    siteName: "Secondary Production Facility",
    plannedQuantity: 75000,
    unit: "tablets",
    bomVersion: 1,
    status: "Completed",
    priority: "Normal",
    plannedStartDate: "2024-01-20T08:00:00Z",
    plannedEndDate: "2024-01-21T18:00:00Z",
    actualStartDate: "2024-01-20T08:15:00Z",
    actualEndDate: "2024-01-21T17:45:00Z",
    assignedTo: "6",
    assignedToName: "Mr. Hassan Ali",
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-19T10:00:00Z",
    updatedAt: "2024-01-21T17:45:00Z",
    remarks: "Completed successfully"
  }
]

// Mock Batches Data
export const mockBatches: Batch[] = [
  {
    id: "1",
    batchNumber: "BATCH-001-2024",
    workOrderId: "1",
    workOrderNumber: "WO-001",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    drugCode: "DRG-001",
    siteId: "1",
    siteName: "Main Production Facility",
    plannedQuantity: 100000,
    actualQuantity: 98500,
    unit: "tablets",
    bomVersion: 1,
    status: "In Progress",
    priority: "High",
    plannedStartDate: "2024-01-25T08:00:00Z",
    plannedEndDate: "2024-01-26T18:00:00Z",
    actualStartDate: "2024-01-25T08:30:00Z",
    startedBy: "6",
    startedByName: "Mr. Hassan Ali",
    startedAt: "2024-01-25T08:30:00Z",
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-25T08:00:00Z",
    updatedAt: "2024-01-25T08:30:00Z",
    remarks: "Batch in progress"
  },
  {
    id: "2",
    batchNumber: "BATCH-002-2024",
    workOrderId: "3",
    workOrderNumber: "WO-003",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    drugCode: "DRG-001",
    siteId: "2",
    siteName: "Secondary Production Facility",
    plannedQuantity: 75000,
    actualQuantity: 74250,
    unit: "tablets",
    bomVersion: 1,
    status: "QC Pending",
    priority: "Normal",
    plannedStartDate: "2024-01-20T08:00:00Z",
    plannedEndDate: "2024-01-21T18:00:00Z",
    actualStartDate: "2024-01-20T08:15:00Z",
    actualEndDate: "2024-01-21T17:45:00Z",
    startedBy: "6",
    startedByName: "Mr. Hassan Ali",
    startedAt: "2024-01-20T08:15:00Z",
    completedBy: "6",
    completedByName: "Mr. Hassan Ali",
    completedAt: "2024-01-21T17:45:00Z",
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-20T08:00:00Z",
    updatedAt: "2024-01-21T17:45:00Z",
    remarks: "Batch completed, awaiting QC"
  },
  {
    id: "3",
    batchNumber: "BATCH-003-2024",
    workOrderId: "2",
    workOrderNumber: "WO-002",
    drugId: "2",
    drugName: "Ibuprofen Tablets",
    drugCode: "DRG-002",
    siteId: "1",
    siteName: "Main Production Facility",
    plannedQuantity: 50000,
    unit: "tablets",
    bomVersion: 1,
    status: "Planned",
    priority: "Normal",
    plannedStartDate: "2024-01-27T08:00:00Z",
    plannedEndDate: "2024-01-28T18:00:00Z",
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-24T10:00:00Z",
    updatedAt: "2024-01-24T10:00:00Z",
    remarks: "Planned batch"
  }
]

// Mock Electronic Batch Records Data
export const mockEBRs: ElectronicBatchRecord[] = [
  {
    id: "1",
    batchId: "1",
    batchNumber: "BATCH-001-2024",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    drugCode: "DRG-001",
    siteId: "1",
    siteName: "Main Production Facility",
    status: "In Progress",
    steps: [
      {
        id: "1",
        stepNumber: 1,
        instruction: "Material Dispensing",
        description: "Dispense all raw materials according to BOM",
        parameters: {
          temperature: "20-25°C",
          humidity: "45-65% RH"
        },
        status: "Completed",
        performedBy: "6",
        performedByName: "Mr. Hassan Ali",
        performedAt: "2024-01-25T08:45:00Z",
        eSignature: "hassan_ali_20240125_084500",
        remarks: "All materials dispensed successfully",
        attachments: []
      },
      {
        id: "2",
        stepNumber: 2,
        instruction: "Granulation",
        description: "Prepare granulation mixture",
        parameters: {
          mixerSpeed: "200 RPM",
          mixingTime: "15 minutes",
          temperature: "25°C"
        },
        status: "Completed",
        performedBy: "6",
        performedByName: "Mr. Hassan Ali",
        performedAt: "2024-01-25T09:30:00Z",
        eSignature: "hassan_ali_20240125_093000",
        remarks: "Granulation completed successfully",
        attachments: []
      },
      {
        id: "3",
        stepNumber: 3,
        instruction: "Drying",
        description: "Dry the granulation",
        parameters: {
          temperature: "60°C",
          dryingTime: "2 hours",
          moistureContent: "< 2%"
        },
        status: "In Progress",
        performedBy: "6",
        performedByName: "Mr. Hassan Ali",
        performedAt: "2024-01-25T10:00:00Z",
        remarks: "Drying in progress",
        attachments: []
      },
      {
        id: "4",
        stepNumber: 4,
        instruction: "Milling",
        description: "Mill the dried granules",
        parameters: {
          screenSize: "1.0 mm",
          millSpeed: "1500 RPM"
        },
        status: "Pending",
        remarks: "Awaiting completion of drying step",
        attachments: []
      }
    ],
    materialConsumption: [
      {
        id: "1",
        materialId: "1",
        materialName: "Paracetamol API",
        materialCode: "RM-001",
        batchNumber: "BATCH-API-001-2024",
        plannedQuantity: 50.0,
        actualQuantity: 49.8,
        unit: "kg",
        consumedAt: "2024-01-25T08:45:00Z",
        consumedBy: "6",
        consumedByName: "Mr. Hassan Ali",
        location: "Dispensing Area A",
        remarks: "Within tolerance"
      },
      {
        id: "2",
        materialId: "2",
        materialName: "Microcrystalline Cellulose",
        materialCode: "RM-002",
        batchNumber: "BATCH-MCC-001-2024",
        plannedQuantity: 25.0,
        actualQuantity: 25.1,
        unit: "kg",
        consumedAt: "2024-01-25T08:45:00Z",
        consumedBy: "6",
        consumedByName: "Mr. Hassan Ali",
        location: "Dispensing Area A",
        remarks: "Within tolerance"
      }
    ],
    qualityChecks: [
      {
        id: "1",
        checkType: "In-Process",
        parameter: "Moisture Content",
        specification: "< 2%",
        result: "1.8%",
        unit: "%",
        passed: true,
        checkedAt: "2024-01-25T12:00:00Z",
        checkedBy: "4",
        checkedByName: "Dr. Fatima Khan",
        remarks: "Within specification"
      }
    ],
    environmentalConditions: [
      {
        id: "1",
        parameter: "Temperature",
        value: 22.5,
        unit: "°C",
        recordedAt: "2024-01-25T08:30:00Z",
        recordedBy: "6",
        recordedByName: "Mr. Hassan Ali",
        remarks: "Within acceptable range"
      },
      {
        id: "2",
        parameter: "Humidity",
        value: 55.2,
        unit: "% RH",
        recordedAt: "2024-01-25T08:30:00Z",
        recordedBy: "6",
        recordedByName: "Mr. Hassan Ali",
        remarks: "Within acceptable range"
      }
    ],
    equipmentUsed: [
      {
        id: "1",
        equipmentId: "EQ-001",
        equipmentName: "High Shear Mixer",
        equipmentCode: "HSM-001",
        usedFrom: "2024-01-25T09:00:00Z",
        usedTo: "2024-01-25T09:30:00Z",
        usedBy: "6",
        usedByName: "Mr. Hassan Ali",
        remarks: "Equipment functioning normally"
      }
    ],
    personnel: [
      {
        id: "1",
        personnelId: "6",
        personnelName: "Mr. Hassan Ali",
        role: "Production Supervisor",
        shift: "Day Shift",
        startTime: "2024-01-25T08:00:00Z",
        endTime: "2024-01-25T16:00:00Z",
        remarks: "Supervising batch production"
      }
    ],
    createdBy: "6",
    createdByName: "Mr. Hassan Ali",
    createdAt: "2024-01-25T08:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z"
  }
]

// Mock Production Sites Data
export const mockProductionSites: ProductionSite[] = [
  {
    id: "1",
    name: "Main Production Facility",
    code: "MPF-001",
    location: "Building A, Floor 1-3",
    type: "Manufacturing",
    capacity: 1000000,
    unit: "tablets/day",
    isActive: true,
    equipment: [
      {
        id: "1",
        name: "High Shear Mixer",
        code: "HSM-001",
        type: "Mixing Equipment",
        model: "GEA Pharma Systems",
        serialNumber: "HSM-001-2023",
        status: "Active",
        lastCalibration: "2024-01-01",
        nextCalibration: "2024-07-01",
        capacity: 100,
        unit: "kg"
      },
      {
        id: "2",
        name: "Fluid Bed Dryer",
        code: "FBD-001",
        type: "Drying Equipment",
        model: "GEA Pharma Systems",
        serialNumber: "FBD-001-2023",
        status: "Active",
        lastCalibration: "2024-01-01",
        nextCalibration: "2024-07-01",
        capacity: 50,
        unit: "kg"
      }
    ]
  },
  {
    id: "2",
    name: "Secondary Production Facility",
    code: "SPF-001",
    location: "Building B, Floor 1-2",
    type: "Manufacturing",
    capacity: 500000,
    unit: "tablets/day",
    isActive: true,
    equipment: [
      {
        id: "3",
        name: "Tablet Press",
        code: "TP-001",
        type: "Compression Equipment",
        model: "Fette P3030",
        serialNumber: "TP-001-2023",
        status: "Active",
        lastCalibration: "2024-01-01",
        nextCalibration: "2024-07-01",
        capacity: 200000,
        unit: "tablets/hour"
      }
    ]
  }
]

// Mock Dashboard Statistics
export const mockManufacturingDashboardStats: ManufacturingDashboardStats = {
  totalBOMs: 12,
  activeBOMs: 10,
  totalWorkOrders: 25,
  plannedWorkOrders: 8,
  inProgressWorkOrders: 3,
  completedWorkOrders: 14,
  totalBatches: 45,
  inProgressBatches: 2,
  qcPendingBatches: 5,
  qaPendingBatches: 3,
  completedBatches: 35,
  averageProductionTime: 18.5,
  yieldRate: 98.2
}
