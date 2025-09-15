import type { SalesOrder, Shipment, ProofOfDelivery, CustomerAccount, ColdChainRecord, TemperatureExcursion, PickList, DistributionDashboardStats, SalesAnalytics } from "@/types/distribution"

// Mock Customer Accounts Data
export const mockCustomerAccounts: CustomerAccount[] = [
  {
    id: "1",
    accountCode: "CUST-001",
    accountName: "Ziauddin Hospital - Clifton",
    accountType: "Hospital",
    status: "Active",
    contactPerson: "Dr. Ahmed Hassan",
    email: "ahmed.hassan@ziauddin.edu.pk",
    phone: "+92-21-3586-3000",
    address: {
      street: "4/B, Shahrah-e-Ghalib, Block 6, Clifton",
      city: "Karachi",
      state: "Sindh",
      postalCode: "75600",
      country: "Pakistan"
    },
    creditLimit: 5000000,
    paymentTerms: "Net 30",
    deliveryInstructions: "Deliver to main pharmacy, ground floor",
    specialRequirements: ["Cold Chain", "Temperature Monitoring"],
    createdBy: "1",
    createdByName: "System Admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    accountCode: "CUST-002",
    accountName: "Aga Khan University Hospital",
    accountType: "Hospital",
    status: "Active",
    contactPerson: "Dr. Fatima Ali",
    email: "fatima.ali@aku.edu",
    phone: "+92-21-3486-1000",
    address: {
      street: "Stadium Road, P.O. Box 3500",
      city: "Karachi",
      state: "Sindh",
      postalCode: "74800",
      country: "Pakistan"
    },
    creditLimit: 10000000,
    paymentTerms: "Net 45",
    deliveryInstructions: "Deliver to central pharmacy, level 2",
    specialRequirements: ["Cold Chain", "Temperature Monitoring", "Priority Handling"],
    createdBy: "1",
    createdByName: "System Admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    accountCode: "CUST-003",
    accountName: "Liaquat National Hospital",
    accountType: "Hospital",
    status: "Active",
    contactPerson: "Dr. Muhammad Khan",
    email: "muhammad.khan@lnh.edu.pk",
    phone: "+92-21-3441-3000",
    address: {
      street: "National Stadium Road",
      city: "Karachi",
      state: "Sindh",
      postalCode: "74800",
      country: "Pakistan"
    },
    creditLimit: 3000000,
    paymentTerms: "Net 30",
    deliveryInstructions: "Deliver to pharmacy department",
    specialRequirements: ["Cold Chain"],
    createdBy: "1",
    createdByName: "System Admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

// Mock Sales Orders Data
export const mockSalesOrders: SalesOrder[] = [
  {
    id: "1",
    orderNumber: "SO-2024-001",
    accountId: "1",
    accountName: "Ziauddin Hospital - Clifton",
    accountCode: "CUST-001",
    siteId: "1",
    siteName: "Main Distribution Center",
    requestedShipDate: "2024-01-25T00:00:00Z",
    actualShipDate: "2024-01-25T08:30:00Z",
    deliveryDate: "2024-01-25T14:00:00Z",
    status: "Delivered",
    priority: "High",
    totalAmount: 150000,
    currency: "PKR",
    specialInstructions: "Urgent delivery required for emergency department",
    items: [
      {
        id: "1",
        drugId: "1",
        drugName: "Paracetamol Tablets",
        drugCode: "DRG-001",
        batchPreference: "FEFO",
        quantity: 10000,
        unit: "tablets",
        unitPrice: 2.50,
        totalPrice: 25000,
        allocatedQuantity: 10000,
        allocatedBatches: [
          {
            id: "1",
            batchNumber: "BATCH-TAB-001-2024",
            quantity: 10000,
            unit: "tablets",
            expiryDate: "2025-03-15",
            location: "B-02-03-01",
            allocatedAt: "2024-01-24T10:00:00Z",
            allocatedBy: "8",
            allocatedByName: "Mr. Muhammad Ali"
          }
        ],
        status: "Delivered",
        remarks: "Emergency order"
      }
    ],
    shippingAddress: {
      street: "4/B, Shahrah-e-Ghalib, Block 6, Clifton",
      city: "Karachi",
      state: "Sindh",
      postalCode: "75600",
      country: "Pakistan",
      contactPerson: "Dr. Ahmed Hassan",
      phone: "+92-21-3586-3000",
      email: "ahmed.hassan@ziauddin.edu.pk",
      deliveryInstructions: "Deliver to main pharmacy, ground floor"
    },
    billingAddress: {
      street: "4/B, Shahrah-e-Ghalib, Block 6, Clifton",
      city: "Karachi",
      state: "Sindh",
      postalCode: "75600",
      country: "Pakistan",
      contactPerson: "Dr. Ahmed Hassan",
      phone: "+92-21-3586-3000",
      email: "ahmed.hassan@ziauddin.edu.pk",
      taxId: "TAX-001-2024"
    },
    createdBy: "11",
    createdByName: "Mr. Saleem Ahmed",
    createdAt: "2024-01-24T09:00:00Z",
    updatedAt: "2024-01-25T14:00:00Z",
    approvedBy: "12",
    approvedByName: "Ms. Ayesha Khan",
    approvedAt: "2024-01-24T10:30:00Z",
    remarks: "Emergency order for critical patients"
  },
  {
    id: "2",
    orderNumber: "SO-2024-002",
    accountId: "2",
    accountName: "Aga Khan University Hospital",
    accountCode: "CUST-002",
    siteId: "1",
    siteName: "Main Distribution Center",
    requestedShipDate: "2024-01-26T00:00:00Z",
    status: "In Progress",
    priority: "Normal",
    totalAmount: 250000,
    currency: "PKR",
    specialInstructions: "Standard delivery",
    items: [
      {
        id: "2",
        drugId: "2",
        drugName: "Ibuprofen Tablets",
        drugCode: "DRG-002",
        batchPreference: "FEFO",
        quantity: 5000,
        unit: "tablets",
        unitPrice: 5.00,
        totalPrice: 25000,
        allocatedQuantity: 5000,
        allocatedBatches: [
          {
            id: "2",
            batchNumber: "BATCH-TAB-002-2024",
            quantity: 5000,
            unit: "tablets",
            expiryDate: "2025-05-20",
            location: "B-02-03-02",
            allocatedAt: "2024-01-25T11:00:00Z",
            allocatedBy: "8",
            allocatedByName: "Mr. Muhammad Ali"
          }
        ],
        status: "Allocated",
        remarks: "Regular order"
      }
    ],
    shippingAddress: {
      street: "Stadium Road, P.O. Box 3500",
      city: "Karachi",
      state: "Sindh",
      postalCode: "74800",
      country: "Pakistan",
      contactPerson: "Dr. Fatima Ali",
      phone: "+92-21-3486-1000",
      email: "fatima.ali@aku.edu",
      deliveryInstructions: "Deliver to central pharmacy, level 2"
    },
    billingAddress: {
      street: "Stadium Road, P.O. Box 3500",
      city: "Karachi",
      state: "Sindh",
      postalCode: "74800",
      country: "Pakistan",
      contactPerson: "Dr. Fatima Ali",
      phone: "+92-21-3486-1000",
      email: "fatima.ali@aku.edu",
      taxId: "TAX-002-2024"
    },
    createdBy: "11",
    createdByName: "Mr. Saleem Ahmed",
    createdAt: "2024-01-25T08:00:00Z",
    updatedAt: "2024-01-25T11:00:00Z",
    approvedBy: "12",
    approvedByName: "Ms. Ayesha Khan",
    approvedAt: "2024-01-25T09:00:00Z"
  }
]

// Mock Shipments Data
export const mockShipments: Shipment[] = [
  {
    id: "1",
    shipmentNumber: "SHIP-2024-001",
    salesOrderId: "1",
    salesOrderNumber: "SO-2024-001",
    accountId: "1",
    accountName: "Ziauddin Hospital - Clifton",
    siteId: "1",
    siteName: "Main Distribution Center",
    status: "Delivered",
    priority: "High",
    shipmentDate: "2024-01-25T08:30:00Z",
    expectedDeliveryDate: "2024-01-25T14:00:00Z",
    actualDeliveryDate: "2024-01-25T13:45:00Z",
    trackingNumber: "TRK-001-2024",
    carrier: "Express Logistics",
    serviceType: "Same Day Delivery",
    packagingInstructions: [
      {
        id: "1",
        drugId: "1",
        drugName: "Paracetamol Tablets",
        packagingType: "Bottles",
        quantity: 10000,
        unit: "tablets",
        specialRequirements: ["Temperature Controlled"],
        temperatureRange: {
          min: 15,
          max: 25,
          unit: "°C"
        },
        handlingInstructions: "Handle with care, keep in cool place"
      }
    ],
    items: [
      {
        id: "1",
        drugId: "1",
        drugName: "Paracetamol Tablets",
        drugCode: "DRG-001",
        batchNumber: "BATCH-TAB-001-2024",
        quantity: 10000,
        unit: "tablets",
        location: "B-02-03-01",
        pickedQuantity: 10000,
        packedQuantity: 10000,
        status: "Delivered",
        pickedBy: "8",
        pickedByName: "Mr. Muhammad Ali",
        pickedAt: "2024-01-25T08:00:00Z",
        packedBy: "8",
        packedByName: "Mr. Muhammad Ali",
        packedAt: "2024-01-25T08:15:00Z"
      }
    ],
    shippingAddress: {
      street: "4/B, Shahrah-e-Ghalib, Block 6, Clifton",
      city: "Karachi",
      state: "Sindh",
      postalCode: "75600",
      country: "Pakistan",
      contactPerson: "Dr. Ahmed Hassan",
      phone: "+92-21-3586-3000",
      email: "ahmed.hassan@ziauddin.edu.pk",
      deliveryInstructions: "Deliver to main pharmacy, ground floor"
    },
    specialHandling: [
      {
        id: "1",
        type: "Temperature Sensitive",
        description: "Temperature controlled storage required",
        instructions: "Maintain temperature between 15-25°C",
        required: true
      }
    ],
    temperatureRequirements: {
      minTemperature: 15,
      maxTemperature: 25,
      unit: "°C",
      monitoringRequired: true,
      alertThreshold: 2
    },
    createdBy: "11",
    createdByName: "Mr. Saleem Ahmed",
    createdAt: "2024-01-25T08:00:00Z",
    updatedAt: "2024-01-25T13:45:00Z",
    remarks: "Emergency delivery completed successfully"
  }
]

// Mock Proof of Delivery Data
export const mockProofOfDeliveries: ProofOfDelivery[] = [
  {
    id: "1",
    podNumber: "POD-2024-001",
    shipmentId: "1",
    shipmentNumber: "SHIP-2024-001",
    salesOrderId: "1",
    salesOrderNumber: "SO-2024-001",
    accountId: "1",
    accountName: "Ziauddin Hospital - Clifton",
    deliveryDate: "2024-01-25",
    deliveryTime: "13:45",
    deliveredBy: "13",
    deliveredByName: "Mr. Ali Raza",
    receivedBy: "Dr. Ahmed Hassan",
    receivedByName: "Dr. Ahmed Hassan",
    receivedByTitle: "Chief Pharmacist",
    signature: "ahmed_hassan_signature_20240125_134500",
    deliveryStatus: "Delivered",
    deliveryNotes: "All items delivered in good condition",
    photos: [
      {
        id: "1",
        fileName: "delivery_photo_001.jpg",
        fileType: "image/jpeg",
        fileSize: 2048000,
        url: "/photos/delivery_photo_001.jpg",
        category: "Delivery",
        takenAt: "2024-01-25T13:45:00Z",
        takenBy: "13",
        takenByName: "Mr. Ali Raza",
        description: "Delivery confirmation photo"
      },
      {
        id: "2",
        fileName: "signature_001.jpg",
        fileType: "image/jpeg",
        fileSize: 1024000,
        url: "/photos/signature_001.jpg",
        category: "Signature",
        takenAt: "2024-01-25T13:45:00Z",
        takenBy: "13",
        takenByName: "Mr. Ali Raza",
        description: "Customer signature"
      }
    ],
    temperatureAtDelivery: 22.5,
    conditionAtDelivery: "Good",
    exceptions: [],
    createdBy: "13",
    createdByName: "Mr. Ali Raza",
    createdAt: "2024-01-25T13:45:00Z",
    remarks: "Delivery completed successfully"
  }
]

// Mock Cold Chain Records Data
export const mockColdChainRecords: ColdChainRecord[] = [
  {
    id: "1",
    shipmentId: "1",
    shipmentNumber: "SHIP-2024-001",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    batchNumber: "BATCH-TAB-001-2024",
    temperature: 22.5,
    humidity: 55.2,
    location: "In Transit - Route A",
    timestamp: "2024-01-25T10:00:00Z",
    sensorId: "TEMP-001",
    status: "Normal",
    remarks: "Temperature within acceptable range"
  },
  {
    id: "2",
    shipmentId: "1",
    shipmentNumber: "SHIP-2024-001",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    batchNumber: "BATCH-TAB-001-2024",
    temperature: 26.8,
    humidity: 58.1,
    location: "In Transit - Route A",
    timestamp: "2024-01-25T12:00:00Z",
    sensorId: "TEMP-001",
    status: "Warning",
    remarks: "Temperature slightly above range"
  }
]

// Mock Temperature Excursions Data
export const mockTemperatureExcursions: TemperatureExcursion[] = [
  {
    id: "1",
    excursionNumber: "TEMP-EXC-001",
    shipmentId: "1",
    shipmentNumber: "SHIP-2024-001",
    drugId: "1",
    drugName: "Paracetamol Tablets",
    batchNumber: "BATCH-TAB-001-2024",
    severity: "Medium",
    status: "Resolved",
    minTemperature: 15,
    maxTemperature: 25,
    actualTemperature: 26.8,
    duration: 30,
    unit: "°C",
    detectedAt: "2024-01-25T12:00:00Z",
    acknowledgedBy: "13",
    acknowledgedByName: "Mr. Ali Raza",
    acknowledgedAt: "2024-01-25T12:05:00Z",
    resolvedBy: "13",
    resolvedByName: "Mr. Ali Raza",
    resolvedAt: "2024-01-25T12:30:00Z",
    correctiveActions: [
      "Moved shipment to cooler area of vehicle",
      "Adjusted temperature control settings",
      "Increased monitoring frequency"
    ],
    remarks: "Temperature excursion resolved within 30 minutes"
  }
]

// Mock Pick Lists Data
export const mockPickLists: PickList[] = [
  {
    id: "1",
    pickListNumber: "PICK-2024-001",
    shipmentId: "1",
    shipmentNumber: "SHIP-2024-001",
    warehouseId: "1",
    warehouseName: "Main Distribution Center",
    status: "Completed",
    priority: "High",
    assignedTo: "8",
    assignedToName: "Mr. Muhammad Ali",
    assignedAt: "2024-01-25T07:30:00Z",
    startedAt: "2024-01-25T08:00:00Z",
    completedAt: "2024-01-25T08:15:00Z",
    items: [
      {
        id: "1",
        drugId: "1",
        drugName: "Paracetamol Tablets",
        drugCode: "DRG-001",
        batchNumber: "BATCH-TAB-001-2024",
        location: "B-02-03-01",
        zone: "B",
        rack: "02",
        shelf: "03",
        position: "01",
        requiredQuantity: 10000,
        pickedQuantity: 10000,
        unit: "tablets",
        expiryDate: "2025-03-15",
        status: "Picked",
        pickedBy: "8",
        pickedByName: "Mr. Muhammad Ali",
        pickedAt: "2024-01-25T08:10:00Z"
      }
    ],
    createdBy: "11",
    createdByName: "Mr. Saleem Ahmed",
    createdAt: "2024-01-25T07:00:00Z",
    remarks: "Emergency pick list for urgent delivery"
  }
]

// Mock Dashboard Statistics
export const mockDistributionDashboardStats: DistributionDashboardStats = {
  totalOrders: 150,
  pendingOrders: 12,
  approvedOrders: 25,
  inProgressOrders: 8,
  shippedOrders: 45,
  deliveredOrders: 60,
  totalShipments: 120,
  pendingShipments: 5,
  inTransitShipments: 15,
  deliveredShipments: 100,
  totalPODs: 100,
  pendingPODs: 3,
  completedPODs: 97,
  averageDeliveryTime: 4.5,
  onTimeDeliveryRate: 95.2,
  customerSatisfactionScore: 4.6
}

// Mock Sales Analytics
export const mockSalesAnalytics: SalesAnalytics = {
  period: "2024-01",
  totalOrders: 150,
  totalRevenue: 2500000,
  averageOrderValue: 16666.67,
  topProducts: [
    {
      drugId: "1",
      drugName: "Paracetamol Tablets",
      quantity: 50000,
      revenue: 125000
    },
    {
      drugId: "2",
      drugName: "Ibuprofen Tablets",
      quantity: 25000,
      revenue: 125000
    },
    {
      drugId: "3",
      drugName: "Aspirin Tablets",
      quantity: 15000,
      revenue: 75000
    }
  ],
  topCustomers: [
    {
      accountId: "1",
      accountName: "Ziauddin Hospital - Clifton",
      orderCount: 45,
      revenue: 750000
    },
    {
      accountId: "2",
      accountName: "Aga Khan University Hospital",
      orderCount: 35,
      revenue: 600000
    },
    {
      accountId: "3",
      accountName: "Liaquat National Hospital",
      orderCount: 25,
      revenue: 400000
    }
  ],
  orderTrends: [
    { date: "2024-01-01", orders: 5, revenue: 85000 },
    { date: "2024-01-02", orders: 8, revenue: 120000 },
    { date: "2024-01-03", orders: 6, revenue: 95000 },
    { date: "2024-01-04", orders: 10, revenue: 150000 },
    { date: "2024-01-05", orders: 7, revenue: 110000 }
  ]
}
