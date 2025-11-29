import type { PurchaseOrder, GoodsReceipt, QCSampleRequest, Supplier, Site, Address } from "@/types/procurement"

// Mock Sites Data
export const mockSites: Site[] = [
  {
    id: "1",
    name: "Ziauddin Hospital - Main Campus",
    code: "ZH-MAIN",
    address: {
      street: "4/B, Shahrah-e-Ghalib, Block 6, PECHS",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postalCode: "75400"
    },
    isActive: true
  },
  {
    id: "2",
    name: "Ziauddin Hospital - Clifton",
    code: "ZH-CLIFTON",
    address: {
      street: "Plot 1, Block 6, Clifton",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postalCode: "75600"
    },
    isActive: true
  },
  {
    id: "3",
    name: "Ziauddin Hospital - North Nazimabad",
    code: "ZH-NN",
    address: {
      street: "Plot 15, Block B, North Nazimabad",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postalCode: "74600"
    },
    isActive: true
  },
  {
    id: "4",
    name: "Ziauddin Hospital - Korangi",
    code: "ZH-KORANGI",
    address: {
      street: "Sector 12, Korangi Industrial Area",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postalCode: "74900"
    },
    isActive: true
  }
]

// Mock Suppliers Data (simplified for procurement)
export const mockProcurementSuppliers: Supplier[] = [
  {
    id: "1",
    name: "MediChem Supplies",
    code: "SUP-001",
    contactPerson: "Dr. Ahmed Hassan",
    email: "ahmed@medichemsupplies.com",
    phone: "+92-21-1234567",
    address: {
      street: "Plot 15, Industrial Area",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postalCode: "75000"
    },
    rating: 4.5,
    deliveryTime: 7,
    paymentTerms: "Net 30",
    isActive: true
  },
  {
    id: "2",
    name: "PharmaExcipients Ltd",
    code: "SUP-002",
    contactPerson: "Ms. Fatima Ali",
    email: "fatima@pharmaexcipients.com",
    phone: "+92-21-2345678",
    address: {
      street: "Block 7, SITE Area",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postalCode: "75700"
    },
    rating: 4.2,
    deliveryTime: 10,
    paymentTerms: "Net 15",
    isActive: true
  },
  {
    id: "3",
    name: "Global Pharma Ingredients",
    code: "SUP-003",
    contactPerson: "Mr. Hassan Raza",
    email: "hassan@globalpharma.com",
    phone: "+92-21-3456789",
    address: {
      street: "Sector 12, Korangi Industrial Area",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postalCode: "74900"
    },
    rating: 4.8,
    deliveryTime: 5,
    paymentTerms: "Net 45",
    isActive: true
  }
]

// Mock Purchase Orders Data
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    supplierId: "1",
    supplierName: "MediChem Supplies",
    siteId: "1",
    siteName: "Ziauddin Hospital - Main Campus",
    expectedDate: "2024-02-15",
    status: "Approved",
    totalAmount: 15750.00,
    currency: "PKR",
    items: [
      {
        id: "1",
        materialId: "1",
        materialName: "Paracetamol API",
        materialCode: "RM-001",
        quantity: 100,
        unitId: "1",
        unitName: "kg",
        unitPrice: 15.50,
        totalPrice: 1550.00,
        receivedQuantity: 100,
        pendingQuantity: 0,
        status: "Fully Received"
      },
      {
        id: "2",
        materialId: "2",
        materialName: "Microcrystalline Cellulose",
        materialCode: "RM-002",
        quantity: 50,
        unitId: "1",
        unitName: "kg",
        unitPrice: 8.75,
        totalPrice: 437.50,
        receivedQuantity: 50,
        pendingQuantity: 0,
        status: "Fully Received"
      }
    ],
    notes: "Urgent delivery required for production",
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    approvedBy: "2",
    approvedByName: "Dr. Sarah Ahmed",
    approvedAt: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    poNumber: "PO-2024-002",
    supplierId: "2",
    supplierName: "PharmaExcipients Ltd",
    siteId: "2",
    siteName: "Ziauddin Hospital - Clifton",
    expectedDate: "2024-02-20",
    status: "Pending Approval",
    totalAmount: 8750.00,
    currency: "PKR",
    items: [
      {
        id: "3",
        materialId: "3",
        materialName: "Magnesium Stearate",
        materialCode: "RM-003",
        quantity: 25,
        unitId: "1",
        unitName: "kg",
        unitPrice: 12.25,
        totalPrice: 306.25,
        receivedQuantity: 0,
        pendingQuantity: 25,
        status: "Pending"
      },
      {
        id: "4",
        materialId: "4",
        materialName: "Lactose Monohydrate",
        materialCode: "RM-004",
        quantity: 100,
        unitId: "1",
        unitName: "kg",
        unitPrice: 6.50,
        totalPrice: 650.00,
        receivedQuantity: 0,
        pendingQuantity: 100,
        status: "Pending"
      }
    ],
    notes: "Standard procurement for Q2 production",
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    createdAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-18T14:00:00Z"
  },
  {
    id: "3",
    poNumber: "PO-2024-003",
    supplierId: "3",
    supplierName: "Global Pharma Ingredients",
    siteId: "1",
    siteName: "Ziauddin Hospital - Main Campus",
    expectedDate: "2024-02-25",
    status: "Partially Received",
    totalAmount: 22500.00,
    currency: "PKR",
    items: [
      {
        id: "5",
        materialId: "5",
        materialName: "Sodium Starch Glycolate",
        materialCode: "RM-005",
        quantity: 200,
        unitId: "1",
        unitName: "kg",
        unitPrice: 18.75,
        totalPrice: 3750.00,
        receivedQuantity: 150,
        pendingQuantity: 50,
        status: "Partially Received"
      },
      {
        id: "6",
        materialId: "6",
        materialName: "Titanium Dioxide",
        materialCode: "RM-006",
        quantity: 50,
        unitId: "1",
        unitName: "kg",
        unitPrice: 25.00,
        totalPrice: 1250.00,
        receivedQuantity: 50,
        pendingQuantity: 0,
        status: "Fully Received"
      }
    ],
    notes: "Bulk order for multiple production batches",
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    approvedBy: "2",
    approvedByName: "Dr. Sarah Ahmed",
    approvedAt: "2024-01-20T11:15:00Z",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-22T16:30:00Z"
  },
  {
    id: "4",
    poNumber: "PO-2024-004",
    supplierId: "1",
    supplierName: "MediChem Supplies",
    siteId: "3",
    siteName: "Ziauddin Hospital - North Nazimabad",
    expectedDate: "2024-03-01",
    status: "Draft",
    totalAmount: 12500.00,
    currency: "PKR",
    items: [
      {
        id: "7",
        materialId: "7",
        materialName: "Hydroxypropyl Methylcellulose",
        materialCode: "RM-007",
        quantity: 75,
        unitId: "1",
        unitName: "kg",
        unitPrice: 22.50,
        totalPrice: 1687.50,
        receivedQuantity: 0,
        pendingQuantity: 75,
        status: "Pending"
      }
    ],
    notes: "Draft order for review",
    createdBy: "1",
    createdByName: "Dr. Ahmed Khan",
    createdAt: "2024-01-25T09:30:00Z",
    updatedAt: "2024-01-25T09:30:00Z"
  }
]

// Mock Goods Receipts Data
export const mockGoodsReceipts: GoodsReceipt[] = [
  {
    id: "1",
    grnNumber: "GRN-2024-001",
    poId: "1",
    poNumber: "PO-2024-001",
    supplierId: "1",
    supplierName: "MediChem Supplies",
    siteId: "1",
    siteName: "Ziauddin Hospital - Main Campus",
    receivedDate: "2024-01-20T14:30:00Z",
    receivedBy: "3",
    receivedByName: "Mr. Ali Hassan",
    status: "QC Approved",
    items: [
      {
        id: "1",
        poItemId: "1",
        materialId: "1",
        materialName: "Paracetamol API",
        materialCode: "RM-001",
        orderedQuantity: 100,
        receivedQuantity: 100,
        unitId: "1",
        unitName: "kg",
        batchNumber: "BATCH-001-2024",
        expiryDate: "2026-01-20",
        condition: "Good",
        qcSampleRequired: true,
        qcSampleId: "QC-001"
      },
      {
        id: "2",
        poItemId: "2",
        materialId: "2",
        materialName: "Microcrystalline Cellulose",
        materialCode: "RM-002",
        orderedQuantity: 50,
        receivedQuantity: 50,
        unitId: "1",
        unitName: "kg",
        batchNumber: "BATCH-002-2024",
        expiryDate: "2027-01-20",
        condition: "Good",
        qcSampleRequired: true,
        qcSampleId: "QC-002"
      }
    ],
    notes: "All items received in good condition",
    coaAttached: true,
    qcSampleRequested: true,
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-22T10:15:00Z"
  },
  {
    id: "2",
    grnNumber: "GRN-2024-002",
    poId: "3",
    poNumber: "PO-2024-003",
    supplierId: "3",
    supplierName: "Global Pharma Ingredients",
    siteId: "1",
    siteName: "Ziauddin Hospital - Main Campus",
    receivedDate: "2024-01-22T16:30:00Z",
    receivedBy: "3",
    receivedByName: "Mr. Ali Hassan",
    status: "Pending QC",
    items: [
      {
        id: "3",
        poItemId: "5",
        materialId: "5",
        materialName: "Sodium Starch Glycolate",
        materialCode: "RM-005",
        orderedQuantity: 200,
        receivedQuantity: 150,
        unitId: "1",
        unitName: "kg",
        batchNumber: "BATCH-003-2024",
        expiryDate: "2026-01-22",
        condition: "Good",
        qcSampleRequired: true,
        qcSampleId: "QC-003"
      },
      {
        id: "4",
        poItemId: "6",
        materialId: "6",
        materialName: "Titanium Dioxide",
        materialCode: "RM-006",
        orderedQuantity: 50,
        receivedQuantity: 50,
        unitId: "1",
        unitName: "kg",
        batchNumber: "BATCH-004-2024",
        expiryDate: "2027-01-22",
        condition: "Good",
        qcSampleRequired: false
      }
    ],
    notes: "Partial delivery received, remaining 50kg pending",
    coaAttached: true,
    qcSampleRequested: true,
    createdAt: "2024-01-22T16:30:00Z",
    updatedAt: "2024-01-22T16:30:00Z"
  }
]

// Mock QC Sample Requests Data
export const mockQCSampleRequests: QCSampleRequest[] = [
  {
    id: "1",
    sampleNumber: "QC-001",
    grnId: "1",
    grnNumber: "GRN-2024-001",
    materialId: "1",
    materialName: "Paracetamol API",
    batchNumber: "BATCH-001-2024",
    quantity: 0.5,
    unitId: "1",
    unitName: "kg",
    status: "Completed",
    requestedBy: "3",
    requestedByName: "Mr. Ali Hassan",
    requestedAt: "2024-01-20T15:00:00Z",
    completedBy: "4",
    completedByName: "Dr. Fatima Khan",
    completedAt: "2024-01-22T10:15:00Z",
    testResults: [
      {
        id: "1",
        testId: "TEST-001",
        testName: "Assay",
        specification: "98.0-102.0%",
        result: "99.5%",
        unit: "%",
        passed: true,
        testedBy: "4",
        testedAt: "2024-01-22T10:15:00Z"
      },
      {
        id: "2",
        testId: "TEST-002",
        testName: "Loss on Drying",
        specification: "≤ 0.5%",
        result: "0.2%",
        unit: "%",
        passed: true,
        testedBy: "4",
        testedAt: "2024-01-22T10:15:00Z"
      }
    ]
  },
  {
    id: "2",
    sampleNumber: "QC-002",
    grnId: "1",
    grnNumber: "GRN-2024-001",
    materialId: "2",
    materialName: "Microcrystalline Cellulose",
    batchNumber: "BATCH-002-2024",
    quantity: 0.5,
    unitId: "1",
    unitName: "kg",
    status: "Completed",
    requestedBy: "3",
    requestedByName: "Mr. Ali Hassan",
    requestedAt: "2024-01-20T15:00:00Z",
    completedBy: "4",
    completedByName: "Dr. Fatima Khan",
    completedAt: "2024-01-22T10:15:00Z",
    testResults: [
      {
        id: "3",
        testId: "TEST-003",
        testName: "Identification",
        specification: "Positive",
        result: "Positive",
        unit: "",
        passed: true,
        testedBy: "4",
        testedAt: "2024-01-22T10:15:00Z"
      }
    ]
  },
  {
    id: "3",
    sampleNumber: "QC-003",
    grnId: "2",
    grnNumber: "GRN-2024-002",
    materialId: "5",
    materialName: "Sodium Starch Glycolate",
    batchNumber: "BATCH-003-2024",
    quantity: 0.5,
    unitId: "1",
    unitName: "kg",
    status: "In Progress",
    requestedBy: "3",
    requestedByName: "Mr. Ali Hassan",
    requestedAt: "2024-01-22T17:00:00Z"
  }
]
