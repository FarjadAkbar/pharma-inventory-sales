import type { QCTest, QCSample, QCAnalyst, QCLab, QCEquipment, QCTestResult, QCDashboardStats } from "@/types/quality-control"

// Mock QC Tests Data
export const mockQCTests: QCTest[] = [
  {
    id: "1",
    code: "QC-001",
    name: "Assay",
    description: "Determination of active pharmaceutical ingredient content",
    category: "Assay",
    method: "HPLC-UV",
    specifications: [
      {
        id: "1",
        parameter: "Content",
        minValue: 98.0,
        maxValue: 102.0,
        targetValue: 100.0,
        unit: "%",
        criteria: "Within 98.0-102.0% of label claim",
        isRequired: true
      }
    ],
    unit: "%",
    isActive: true,
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    code: "QC-002",
    name: "Loss on Drying",
    description: "Determination of moisture content",
    category: "Physical",
    method: "Thermogravimetric Analysis",
    specifications: [
      {
        id: "2",
        parameter: "Moisture",
        maxValue: 0.5,
        unit: "%",
        criteria: "Not more than 0.5%",
        isRequired: true
      }
    ],
    unit: "%",
    isActive: true,
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    code: "QC-003",
    name: "Identification",
    description: "Identification test using FTIR spectroscopy",
    category: "Identification",
    method: "FTIR",
    specifications: [
      {
        id: "3",
        parameter: "Identity",
        criteria: "Spectrum matches reference standard",
        isRequired: true
      }
    ],
    unit: "",
    isActive: true,
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    code: "QC-004",
    name: "Dissolution",
    description: "In vitro dissolution test",
    category: "Dissolution",
    method: "USP Apparatus 2 (Paddle)",
    specifications: [
      {
        id: "4",
        parameter: "Q30",
        minValue: 80,
        unit: "%",
        criteria: "Not less than 80% in 30 minutes",
        isRequired: true
      }
    ],
    unit: "%",
    isActive: true,
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    code: "QC-005",
    name: "Microbial Limits",
    description: "Microbiological testing for total aerobic count and pathogens",
    category: "Microbiological",
    method: "USP <61>",
    specifications: [
      {
        id: "5",
        parameter: "Total Aerobic Count",
        maxValue: 1000,
        unit: "CFU/g",
        criteria: "Not more than 1000 CFU/g",
        isRequired: true
      },
      {
        id: "6",
        parameter: "Pathogens",
        criteria: "Absent",
        isRequired: true
      }
    ],
    unit: "CFU/g",
    isActive: true,
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

// Mock QC Samples Data
export const mockQCSamples: QCSample[] = [
  {
    id: "1",
    sampleCode: "QC-SAM-001",
    sourceType: "GRN",
    sourceId: "1",
    sourceReference: "GRN-2024-001",
    materialId: "1",
    materialName: "Paracetamol API",
    materialCode: "RM-001",
    batchNumber: "BATCH-001-2024",
    quantity: 0.5,
    unit: "kg",
    priority: "High",
    status: "Completed",
    assignedTo: "4",
    assignedToName: "Dr. Fatima Khan",
    requestedBy: "3",
    requestedByName: "Mr. Ali Hassan",
    requestedAt: "2024-01-20T15:00:00Z",
    dueDate: "2024-01-22T15:00:00Z",
    completedAt: "2024-01-22T10:15:00Z",
    tests: [
      {
        id: "1",
        testId: "1",
        testName: "Assay",
        testCode: "QC-001",
        status: "Completed",
        assignedTo: "4",
        assignedToName: "Dr. Fatima Khan",
        startedAt: "2024-01-21T09:00:00Z",
        completedAt: "2024-01-22T10:15:00Z"
      },
      {
        id: "2",
        testId: "2",
        testName: "Loss on Drying",
        testCode: "QC-002",
        status: "Completed",
        assignedTo: "4",
        assignedToName: "Dr. Fatima Khan",
        startedAt: "2024-01-21T09:00:00Z",
        completedAt: "2024-01-22T10:15:00Z"
      }
    ],
    remarks: "Sample received in good condition"
  },
  {
    id: "2",
    sampleCode: "QC-SAM-002",
    sourceType: "GRN",
    sourceId: "1",
    sourceReference: "GRN-2024-001",
    materialId: "2",
    materialName: "Microcrystalline Cellulose",
    materialCode: "RM-002",
    batchNumber: "BATCH-002-2024",
    quantity: 0.5,
    unit: "kg",
    priority: "High",
    status: "Completed",
    assignedTo: "4",
    assignedToName: "Dr. Fatima Khan",
    requestedBy: "3",
    requestedByName: "Mr. Ali Hassan",
    requestedAt: "2024-01-20T15:00:00Z",
    dueDate: "2024-01-22T15:00:00Z",
    completedAt: "2024-01-22T10:15:00Z",
    tests: [
      {
        id: "3",
        testId: "3",
        testName: "Identification",
        testCode: "QC-003",
        status: "Completed",
        assignedTo: "4",
        assignedToName: "Dr. Fatima Khan",
        startedAt: "2024-01-21T09:00:00Z",
        completedAt: "2024-01-22T10:15:00Z"
      }
    ],
    remarks: "Sample received in good condition"
  },
  {
    id: "3",
    sampleCode: "QC-SAM-003",
    sourceType: "GRN",
    sourceId: "2",
    sourceReference: "GRN-2024-002",
    materialId: "5",
    materialName: "Sodium Starch Glycolate",
    materialCode: "RM-005",
    batchNumber: "BATCH-003-2024",
    quantity: 0.5,
    unit: "kg",
    priority: "Normal",
    status: "In Progress",
    assignedTo: "5",
    assignedToName: "Ms. Ayesha Ahmed",
    requestedBy: "3",
    requestedByName: "Mr. Ali Hassan",
    requestedAt: "2024-01-22T17:00:00Z",
    dueDate: "2024-01-25T17:00:00Z",
    tests: [
      {
        id: "4",
        testId: "1",
        testName: "Assay",
        testCode: "QC-001",
        status: "In Progress",
        assignedTo: "5",
        assignedToName: "Ms. Ayesha Ahmed",
        startedAt: "2024-01-23T09:00:00Z"
      },
      {
        id: "5",
        testId: "2",
        testName: "Loss on Drying",
        testCode: "QC-002",
        status: "Pending",
        assignedTo: "5",
        assignedToName: "Ms. Ayesha Ahmed"
      }
    ],
    remarks: "Urgent testing required for production"
  },
  {
    id: "4",
    sampleCode: "QC-SAM-004",
    sourceType: "Batch",
    sourceId: "1",
    sourceReference: "BATCH-2024-001",
    materialId: "1",
    materialName: "Paracetamol Tablets",
    materialCode: "DRG-001",
    batchNumber: "BATCH-TAB-001-2024",
    quantity: 0.1,
    unit: "kg",
    priority: "Urgent",
    status: "Pending",
    requestedBy: "6",
    requestedByName: "Mr. Hassan Ali",
    requestedAt: "2024-01-24T10:00:00Z",
    dueDate: "2024-01-26T10:00:00Z",
    tests: [
      {
        id: "6",
        testId: "1",
        testName: "Assay",
        testCode: "QC-001",
        status: "Pending"
      },
      {
        id: "7",
        testId: "4",
        testName: "Dissolution",
        testCode: "QC-004",
        status: "Pending"
      }
    ],
    remarks: "Final product testing before release"
  }
]

// Mock QC Test Results Data
export const mockQCTestResults: QCTestResult[] = [
  {
    id: "1",
    testId: "1",
    sampleId: "1",
    sampleTestId: "1",
    parameter: "Content",
    resultValue: "99.5",
    unit: "%",
    specification: {
      id: "1",
      parameter: "Content",
      minValue: 98.0,
      maxValue: 102.0,
      targetValue: 100.0,
      unit: "%",
      criteria: "Within 98.0-102.0% of label claim",
      isRequired: true
    },
    passed: true,
    deviation: -0.5,
    remarks: "Within specification limits",
    testedBy: "4",
    testedByName: "Dr. Fatima Khan",
    testedAt: "2024-01-22T10:15:00Z",
    reviewedBy: "7",
    reviewedByName: "Dr. Sarah Ahmed",
    reviewedAt: "2024-01-22T11:00:00Z"
  },
  {
    id: "2",
    testId: "2",
    sampleId: "1",
    sampleTestId: "2",
    parameter: "Moisture",
    resultValue: "0.2",
    unit: "%",
    specification: {
      id: "2",
      parameter: "Moisture",
      maxValue: 0.5,
      unit: "%",
      criteria: "Not more than 0.5%",
      isRequired: true
    },
    passed: true,
    remarks: "Well within specification",
    testedBy: "4",
    testedByName: "Dr. Fatima Khan",
    testedAt: "2024-01-22T10:15:00Z",
    reviewedBy: "7",
    reviewedByName: "Dr. Sarah Ahmed",
    reviewedAt: "2024-01-22T11:00:00Z"
  },
  {
    id: "3",
    testId: "3",
    sampleId: "2",
    sampleTestId: "3",
    parameter: "Identity",
    resultValue: "Positive",
    unit: "",
    specification: {
      id: "3",
      parameter: "Identity",
      criteria: "Spectrum matches reference standard",
      isRequired: true
    },
    passed: true,
    remarks: "FTIR spectrum matches reference standard",
    testedBy: "4",
    testedByName: "Dr. Fatima Khan",
    testedAt: "2024-01-22T10:15:00Z",
    reviewedBy: "7",
    reviewedByName: "Dr. Sarah Ahmed",
    reviewedAt: "2024-01-22T11:00:00Z"
  }
]

// Mock QC Analysts Data
export const mockQCAnalysts: QCAnalyst[] = [
  {
    id: "4",
    name: "Dr. Fatima Khan",
    email: "fatima@ziauddin.com",
    specialization: ["Chemical Analysis", "HPLC", "FTIR"],
    certifications: ["ISO 17025", "GMP"],
    isActive: true,
    currentWorkload: 3,
    maxWorkload: 10
  },
  {
    id: "5",
    name: "Ms. Ayesha Ahmed",
    email: "ayesha@ziauddin.com",
    specialization: ["Physical Testing", "Dissolution", "Content Uniformity"],
    certifications: ["ISO 17025"],
    isActive: true,
    currentWorkload: 2,
    maxWorkload: 8
  },
  {
    id: "6",
    name: "Mr. Hassan Ali",
    email: "hassan@ziauddin.com",
    specialization: ["Microbiological Testing", "Sterility Testing"],
    certifications: ["ISO 17025", "Microbiology"],
    isActive: true,
    currentWorkload: 1,
    maxWorkload: 6
  }
]

// Mock QC Labs Data
export const mockQCLabs: QCLab[] = [
  {
    id: "1",
    name: "Main QC Laboratory",
    code: "QC-MAIN",
    location: "Building A, Floor 2",
    equipment: [
      {
        id: "1",
        name: "HPLC System",
        model: "Agilent 1260 Infinity II",
        serialNumber: "HPLC-001",
        calibrationDate: "2024-01-01",
        nextCalibrationDate: "2024-07-01",
        status: "Active"
      },
      {
        id: "2",
        name: "FTIR Spectrometer",
        model: "PerkinElmer Spectrum Two",
        serialNumber: "FTIR-001",
        calibrationDate: "2024-01-15",
        nextCalibrationDate: "2024-07-15",
        status: "Active"
      }
    ],
    isActive: true
  },
  {
    id: "2",
    name: "Microbiology Laboratory",
    code: "QC-MICRO",
    location: "Building B, Floor 1",
    equipment: [
      {
        id: "3",
        name: "Laminar Air Flow",
        model: "Esco Airstream",
        serialNumber: "LAF-001",
        calibrationDate: "2024-01-10",
        nextCalibrationDate: "2024-07-10",
        status: "Active"
      }
    ],
    isActive: true
  }
]

// Mock Dashboard Statistics
export const mockQCDashboardStats: QCDashboardStats = {
  totalSamples: 24,
  pendingSamples: 3,
  inProgressSamples: 2,
  completedSamples: 18,
  overdueSamples: 1,
  totalTests: 45,
  passedTests: 42,
  failedTests: 3,
  averageTurnaroundTime: 2.5
}
