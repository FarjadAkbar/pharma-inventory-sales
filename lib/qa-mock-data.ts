import type { QARelease, QADeviation, QACAPA, QADashboardStats, QCResultSummary, QAChecklistItem } from "@/types/quality-assurance"

// Mock QA Releases Data
export const mockQAReleases: QARelease[] = [
  {
    id: "1",
    releaseNumber: "QA-REL-001",
    entityType: "ReceiptItem",
    entityId: "1",
    entityReference: "GRN-2024-001",
    materialId: "1",
    materialName: "Paracetamol API",
    materialCode: "RM-001",
    batchNumber: "BATCH-001-2024",
    quantity: 0.5,
    unit: "kg",
    sourceType: "GRN",
    sourceId: "1",
    sourceReference: "GRN-2024-001",
    status: "Approved",
    priority: "High",
    qcResults: [
      {
        id: "1",
        testId: "1",
        testName: "Assay",
        testCode: "QC-001",
        parameter: "Content",
        resultValue: "99.5",
        unit: "%",
        specification: "98.0-102.0%",
        passed: true,
        deviation: -0.5,
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
        testName: "Loss on Drying",
        testCode: "QC-002",
        parameter: "Moisture",
        resultValue: "0.2",
        unit: "%",
        specification: "≤ 0.5%",
        passed: true,
        testedBy: "4",
        testedByName: "Dr. Fatima Khan",
        testedAt: "2024-01-22T10:15:00Z",
        reviewedBy: "7",
        reviewedByName: "Dr. Sarah Ahmed",
        reviewedAt: "2024-01-22T11:00:00Z"
      }
    ],
    decision: "Release",
    checklistItems: [
      {
        id: "1",
        item: "QC Results Review",
        description: "All QC test results reviewed and within specification",
        category: "Testing",
        checked: true,
        checkedBy: "7",
        checkedByName: "Dr. Sarah Ahmed",
        checkedAt: "2024-01-22T11:00:00Z",
        isRequired: true
      },
      {
        id: "2",
        item: "Documentation Complete",
        description: "All required documentation is complete and accurate",
        category: "Documentation",
        checked: true,
        checkedBy: "7",
        checkedByName: "Dr. Sarah Ahmed",
        checkedAt: "2024-01-22T11:00:00Z",
        isRequired: true
      },
      {
        id: "3",
        item: "Traceability Verified",
        description: "Material traceability from supplier to receipt verified",
        category: "Traceability",
        checked: true,
        checkedBy: "7",
        checkedByName: "Dr. Sarah Ahmed",
        checkedAt: "2024-01-22T11:00:00Z",
        isRequired: true
      }
    ],
    reviewedBy: "7",
    reviewedByName: "Dr. Sarah Ahmed",
    reviewedAt: "2024-01-22T11:00:00Z",
    eSignature: "sarah_ahmed_20240122_110000",
    submittedBy: "4",
    submittedByName: "Dr. Fatima Khan",
    submittedAt: "2024-01-22T10:30:00Z",
    dueDate: "2024-01-24T10:30:00Z",
    completedAt: "2024-01-22T11:00:00Z",
    remarks: "All tests passed, material approved for use"
  },
  {
    id: "2",
    releaseNumber: "QA-REL-002",
    entityType: "ReceiptItem",
    entityId: "2",
    entityReference: "GRN-2024-001",
    materialId: "2",
    materialName: "Microcrystalline Cellulose",
    materialCode: "RM-002",
    batchNumber: "BATCH-002-2024",
    quantity: 0.5,
    unit: "kg",
    sourceType: "GRN",
    sourceId: "1",
    sourceReference: "GRN-2024-001",
    status: "Under Review",
    priority: "Normal",
    qcResults: [
      {
        id: "3",
        testId: "3",
        testName: "Identification",
        testCode: "QC-003",
        parameter: "Identity",
        resultValue: "Positive",
        unit: "",
        specification: "Spectrum matches reference standard",
        passed: true,
        testedBy: "4",
        testedByName: "Dr. Fatima Khan",
        testedAt: "2024-01-22T10:15:00Z"
      }
    ],
    decision: "Pending",
    checklistItems: [
      {
        id: "4",
        item: "QC Results Review",
        description: "All QC test results reviewed and within specification",
        category: "Testing",
        checked: false,
        isRequired: true
      },
      {
        id: "5",
        item: "Documentation Complete",
        description: "All required documentation is complete and accurate",
        category: "Documentation",
        checked: false,
        isRequired: true
      },
      {
        id: "6",
        item: "Traceability Verified",
        description: "Material traceability from supplier to receipt verified",
        category: "Traceability",
        checked: false,
        isRequired: true
      }
    ],
    submittedBy: "4",
    submittedByName: "Dr. Fatima Khan",
    submittedAt: "2024-01-22T10:30:00Z",
    dueDate: "2024-01-24T10:30:00Z",
    remarks: "Pending QA review"
  },
  {
    id: "3",
    releaseNumber: "QA-REL-003",
    entityType: "Batch",
    entityId: "1",
    entityReference: "BATCH-2024-001",
    materialId: "1",
    materialName: "Paracetamol Tablets",
    materialCode: "DRG-001",
    batchNumber: "BATCH-TAB-001-2024",
    quantity: 0.1,
    unit: "kg",
    sourceType: "Production",
    sourceId: "1",
    sourceReference: "BATCH-2024-001",
    status: "On Hold",
    priority: "Urgent",
    qcResults: [
      {
        id: "4",
        testId: "1",
        testName: "Assay",
        testCode: "QC-001",
        parameter: "Content",
        resultValue: "97.2",
        unit: "%",
        specification: "98.0-102.0%",
        passed: false,
        deviation: -0.8,
        testedBy: "5",
        testedByName: "Ms. Ayesha Ahmed",
        testedAt: "2024-01-24T14:30:00Z"
      },
      {
        id: "5",
        testId: "4",
        testName: "Dissolution",
        testCode: "QC-004",
        parameter: "Q30",
        resultValue: "75.5",
        unit: "%",
        specification: "≥ 80%",
        passed: false,
        testedBy: "5",
        testedByName: "Ms. Ayesha Ahmed",
        testedAt: "2024-01-24T14:30:00Z"
      }
    ],
    decision: "Hold",
    decisionReason: "Assay and dissolution results out of specification",
    checklistItems: [
      {
        id: "7",
        item: "QC Results Review",
        description: "All QC test results reviewed and within specification",
        category: "Testing",
        checked: false,
        remarks: "Results out of specification - investigation required",
        isRequired: true
      },
      {
        id: "8",
        item: "Documentation Complete",
        description: "All required documentation is complete and accurate",
        category: "Documentation",
        checked: true,
        checkedBy: "7",
        checkedByName: "Dr. Sarah Ahmed",
        checkedAt: "2024-01-24T15:00:00Z",
        isRequired: true
      },
      {
        id: "9",
        item: "Traceability Verified",
        description: "Material traceability from supplier to receipt verified",
        category: "Traceability",
        checked: true,
        checkedBy: "7",
        checkedByName: "Dr. Sarah Ahmed",
        checkedAt: "2024-01-24T15:00:00Z",
        isRequired: true
      }
    ],
    submittedBy: "5",
    submittedByName: "Ms. Ayesha Ahmed",
    submittedAt: "2024-01-24T14:45:00Z",
    dueDate: "2024-01-26T14:45:00Z",
    remarks: "Batch on hold pending investigation of OOS results"
  }
]

// Mock QA Deviations Data
export const mockQADeviations: QADeviation[] = [
  {
    id: "1",
    deviationNumber: "DEV-001",
    title: "Out of Specification Assay Result",
    description: "Assay result for Paracetamol Tablets batch BATCH-TAB-001-2024 was 97.2%, below the specification limit of 98.0%",
    severity: "Major",
    category: "Quality",
    status: "Under Investigation",
    sourceType: "QC",
    sourceId: "4",
    sourceReference: "QC-SAM-004",
    materialId: "1",
    materialName: "Paracetamol Tablets",
    batchNumber: "BATCH-TAB-001-2024",
    discoveredBy: "5",
    discoveredByName: "Ms. Ayesha Ahmed",
    discoveredAt: "2024-01-24T14:30:00Z",
    assignedTo: "7",
    assignedToName: "Dr. Sarah Ahmed",
    assignedAt: "2024-01-24T15:00:00Z",
    dueDate: "2024-01-31T15:00:00Z",
    rootCause: "Under investigation",
    immediateAction: "Batch placed on hold pending investigation",
    correctiveAction: "TBD",
    preventiveAction: "TBD",
    effectivenessCheck: "TBD",
    attachments: [],
    timeline: [
      {
        id: "1",
        event: "Deviation Opened",
        description: "Deviation opened for OOS assay result",
        performedBy: "5",
        performedByName: "Ms. Ayesha Ahmed",
        performedAt: "2024-01-24T14:30:00Z",
        status: "Completed"
      },
      {
        id: "2",
        event: "Assigned for Investigation",
        description: "Deviation assigned to QA Manager for investigation",
        performedBy: "7",
        performedByName: "Dr. Sarah Ahmed",
        performedAt: "2024-01-24T15:00:00Z",
        status: "Completed"
      }
    ]
  },
  {
    id: "2",
    deviationNumber: "DEV-002",
    title: "Equipment Calibration Overdue",
    description: "HPLC System calibration is overdue by 5 days",
    severity: "Minor",
    category: "Equipment",
    status: "Open",
    sourceType: "QC",
    sourceId: "1",
    sourceReference: "HPLC-001",
    discoveredBy: "4",
    discoveredByName: "Dr. Fatima Khan",
    discoveredAt: "2024-01-20T09:00:00Z",
    assignedTo: "8",
    assignedToName: "Mr. Muhammad Ali",
    assignedAt: "2024-01-20T09:30:00Z",
    dueDate: "2024-01-25T09:30:00Z",
    rootCause: "Scheduled maintenance delayed",
    immediateAction: "Equipment taken out of service until calibration",
    correctiveAction: "Complete calibration and update schedule",
    preventiveAction: "Implement automated calibration reminders",
    effectivenessCheck: "Monitor calibration schedule compliance",
    attachments: [],
    timeline: [
      {
        id: "3",
        event: "Deviation Opened",
        description: "Deviation opened for overdue calibration",
        performedBy: "4",
        performedByName: "Dr. Fatima Khan",
        performedAt: "2024-01-20T09:00:00Z",
        status: "Completed"
      },
      {
        id: "4",
        event: "Assigned for Action",
        description: "Deviation assigned to maintenance team",
        performedBy: "8",
        performedByName: "Mr. Muhammad Ali",
        performedAt: "2024-01-20T09:30:00Z",
        status: "Completed"
      }
    ]
  }
]

// Mock QA CAPAs Data
export const mockQACAPAs: QACAPA[] = [
  {
    id: "1",
    capaNumber: "CAPA-001",
    title: "Improve Calibration Management System",
    description: "Implement automated calibration reminders and tracking system to prevent overdue calibrations",
    type: "Preventive Action",
    status: "In Progress",
    priority: "High",
    deviationId: "2",
    deviationNumber: "DEV-002",
    rootCause: "Manual tracking of calibration schedules led to missed deadlines",
    immediateAction: "Equipment taken out of service until calibration completed",
    correctiveAction: "Complete overdue calibration and update maintenance schedule",
    preventiveAction: "Implement automated calibration reminder system with email notifications",
    effectivenessCheck: "Monitor calibration compliance rate monthly for 6 months",
    assignedTo: "8",
    assignedToName: "Mr. Muhammad Ali",
    assignedAt: "2024-01-20T10:00:00Z",
    dueDate: "2024-02-20T10:00:00Z",
    effectivenessVerified: false,
    attachments: [],
    timeline: [
      {
        id: "5",
        event: "CAPA Opened",
        description: "CAPA opened for calibration management improvement",
        performedBy: "7",
        performedByName: "Dr. Sarah Ahmed",
        performedAt: "2024-01-20T10:00:00Z",
        status: "Completed"
      },
      {
        id: "6",
        event: "Assigned for Implementation",
        description: "CAPA assigned to maintenance team for implementation",
        performedBy: "8",
        performedByName: "Mr. Muhammad Ali",
        performedAt: "2024-01-20T10:30:00Z",
        status: "Completed"
      }
    ]
  },
  {
    id: "2",
    capaNumber: "CAPA-002",
    title: "Enhance QC Testing Procedures",
    description: "Review and update QC testing procedures to prevent OOS results",
    type: "Corrective Action",
    status: "Open",
    priority: "Urgent",
    deviationId: "1",
    deviationNumber: "DEV-001",
    rootCause: "TBD - Under investigation",
    immediateAction: "Batch on hold pending investigation",
    correctiveAction: "TBD - Pending root cause analysis",
    preventiveAction: "TBD - Pending root cause analysis",
    effectivenessCheck: "TBD - Pending root cause analysis",
    assignedTo: "7",
    assignedToName: "Dr. Sarah Ahmed",
    assignedAt: "2024-01-24T15:30:00Z",
    dueDate: "2024-02-24T15:30:00Z",
    effectivenessVerified: false,
    attachments: [],
    timeline: [
      {
        id: "7",
        event: "CAPA Opened",
        description: "CAPA opened for QC testing procedure enhancement",
        performedBy: "7",
        performedByName: "Dr. Sarah Ahmed",
        performedAt: "2024-01-24T15:30:00Z",
        status: "Completed"
      }
    ]
  }
]

// Mock Dashboard Statistics
export const mockQADashboardStats: QADashboardStats = {
  totalReleases: 15,
  pendingReleases: 3,
  approvedReleases: 10,
  rejectedReleases: 1,
  onHoldReleases: 1,
  totalDeviations: 8,
  openDeviations: 2,
  closedDeviations: 5,
  overdueDeviations: 1,
  totalCAPAs: 6,
  openCAPAs: 2,
  closedCAPAs: 3,
  overdueCAPAs: 1,
  averageResolutionTime: 5.2,
  complianceScore: 87.5
}
