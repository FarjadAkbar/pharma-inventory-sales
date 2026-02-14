import type { Drug, RawMaterial, Supplier, Address, SupplierPerformance } from "@/types/pharma"

// Mock Drugs Data
export const mockDrugs: Drug[] = [
  {
    id: "1",
    code: "DRG-001",
    name: "Paracetamol",
    formula: "C8H9NO2",
    strength: "500mg",
    dosageForm: "Tablet",
    route: "Oral",
    description: "Analgesic and antipyretic medication",
    approvalStatus: "Approved",
    therapeuticClass: "Analgesics",
    manufacturer: "Ziauddin Pharmaceuticals",
    registrationNumber: "DRAP-2024-001",
    expiryDate: "2026-12-31",
    storageConditions: [
      { type: "temperature", minValue: 15, maxValue: 30, unit: "°C", description: "Room temperature" },
      { type: "humidity", maxValue: 60, unit: "%", description: "Maximum 60% humidity" }
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "2",
    code: "DRG-002",
    name: "Amoxicillin",
    formula: "C16H19N3O5S",
    strength: "250mg",
    dosageForm: "Capsule",
    route: "Oral",
    description: "Antibiotic medication",
    approvalStatus: "Approved",
    therapeuticClass: "Antibiotics",
    manufacturer: "Ziauddin Pharmaceuticals",
    registrationNumber: "DRAP-2024-002",
    expiryDate: "2025-06-30",
    storageConditions: [
      { type: "temperature", minValue: 2, maxValue: 8, unit: "°C", description: "Refrigerated storage" },
      { type: "humidity", maxValue: 50, unit: "%", description: "Maximum 50% humidity" }
    ],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "3",
    code: "DRG-003",
    name: "Insulin Glargine",
    formula: "C267H404N72O78S6",
    strength: "100 IU/ml",
    dosageForm: "Injection",
    route: "SC",
    description: "Long-acting insulin for diabetes management",
    approvalStatus: "Approved",
    therapeuticClass: "Antidiabetics",
    manufacturer: "Ziauddin Pharmaceuticals",
    registrationNumber: "DRAP-2024-003",
    expiryDate: "2025-03-31",
    storageConditions: [
      { type: "temperature", minValue: 2, maxValue: 8, unit: "°C", description: "Refrigerated storage" },
      { type: "light", description: "Protect from light" }
    ],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "4",
    code: "DRG-004",
    name: "Omeprazole",
    formula: "C17H19N3O3S",
    strength: "20mg",
    dosageForm: "Capsule",
    route: "Oral",
    description: "Proton pump inhibitor for acid reflux",
    approvalStatus: "Pending",
    therapeuticClass: "Gastrointestinal Agents",
    manufacturer: "Ziauddin Pharmaceuticals",
    registrationNumber: "DRAP-2024-004",
    storageConditions: [
      { type: "temperature", minValue: 15, maxValue: 30, unit: "°C", description: "Room temperature" },
      { type: "humidity", maxValue: 60, unit: "%", description: "Maximum 60% humidity" }
    ],
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "5",
    code: "DRG-005",
    name: "Salbutamol",
    formula: "C13H21NO3",
    strength: "100mcg",
    dosageForm: "Inhaler",
    route: "Inhalation",
    description: "Bronchodilator for asthma treatment",
    approvalStatus: "Approved",
    therapeuticClass: "Respiratory Agents",
    manufacturer: "Ziauddin Pharmaceuticals",
    registrationNumber: "DRAP-2024-005",
    expiryDate: "2025-09-30",
    storageConditions: [
      { type: "temperature", minValue: 15, maxValue: 30, unit: "°C", description: "Room temperature" },
      { type: "humidity", maxValue: 60, unit: "%", description: "Maximum 60% humidity" }
    ],
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
    createdBy: "1"
  }
]

// Mock Raw Materials Data
export const mockRawMaterials: RawMaterial[] = [
  {
    id: "1",
    code: "RM-001",
    name: "Paracetamol API",
    grade: "USP",
    specification: "99.5% purity, white crystalline powder",
    unit: "kg",
    supplierId: "1",
    supplierName: "MediChem Supplies",
    storageRequirements: [
      { type: "temperature", minValue: 15, maxValue: 30, unit: "°C", description: "Room temperature" },
      { type: "humidity", maxValue: 60, unit: "%", description: "Maximum 60% humidity" }
    ],
    shelfLife: 1095, // 3 years
    minOrderQuantity: 100,
    maxOrderQuantity: 1000,
    currentStock: 250,
    reorderLevel: 150,
    costPerUnit: 15.50,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "2",
    code: "RM-002",
    name: "Microcrystalline Cellulose",
    grade: "Pharmaceutical",
    specification: "NF grade, 25-100 μm particle size",
    unit: "kg",
    supplierId: "2",
    supplierName: "PharmaExcipients Ltd",
    storageRequirements: [
      { type: "temperature", minValue: 15, maxValue: 30, unit: "°C", description: "Room temperature" },
      { type: "humidity", maxValue: 50, unit: "%", description: "Maximum 50% humidity" }
    ],
    shelfLife: 1825, // 5 years
    minOrderQuantity: 50,
    maxOrderQuantity: 500,
    currentStock: 120,
    reorderLevel: 80,
    costPerUnit: 8.75,
    isActive: true,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "3",
    code: "RM-003",
    name: "Magnesium Stearate",
    grade: "USP",
    specification: "Food grade, 40-60 μm particle size",
    unit: "kg",
    supplierId: "1",
    supplierName: "MediChem Supplies",
    storageRequirements: [
      { type: "temperature", minValue: 15, maxValue: 30, unit: "°C", description: "Room temperature" },
      { type: "humidity", maxValue: 50, unit: "%", description: "Maximum 50% humidity" }
    ],
    shelfLife: 1095, // 3 years
    minOrderQuantity: 25,
    maxOrderQuantity: 200,
    currentStock: 45,
    reorderLevel: 30,
    costPerUnit: 12.25,
    isActive: true,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "4",
    code: "RM-004",
    name: "Lactose Monohydrate",
    grade: "Pharmaceutical",
    specification: "Direct compression grade, 200 mesh",
    unit: "kg",
    supplierId: "3",
    supplierName: "Global Pharma Ingredients",
    storageRequirements: [
      { type: "temperature", minValue: 15, maxValue: 30, unit: "°C", description: "Room temperature" },
      { type: "humidity", maxValue: 60, unit: "%", description: "Maximum 60% humidity" }
    ],
    shelfLife: 1825, // 5 years
    minOrderQuantity: 100,
    maxOrderQuantity: 1000,
    currentStock: 300,
    reorderLevel: 200,
    costPerUnit: 6.50,
    isActive: true,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
    createdBy: "1"
  }
]

// Mock Suppliers Data
export const mockSuppliers: Supplier[] = [
  {
    id: "1",
    code: "SUP-001",
    name: "MediChem Supplies",
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
    performance: {
      onTimeDelivery: 95.5,
      qualityScore: 4.8,
      responseTime: 2.5,
      totalOrders: 156,
      successfulOrders: 149,
      lastOrderDate: "2024-01-15T00:00:00Z"
    },
    certifications: ["ISO 9001:2015", "GMP", "WHO Prequalified"],
    paymentTerms: "Net 30",
    deliveryTime: 7,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "2",
    code: "SUP-002",
    name: "PharmaExcipients Ltd",
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
    performance: {
      onTimeDelivery: 88.3,
      qualityScore: 4.5,
      responseTime: 4.2,
      totalOrders: 89,
      successfulOrders: 79,
      lastOrderDate: "2024-01-10T00:00:00Z"
    },
    certifications: ["ISO 9001:2015", "GMP"],
    paymentTerms: "Net 15",
    deliveryTime: 10,
    isActive: true,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "3",
    code: "SUP-003",
    name: "Global Pharma Ingredients",
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
    performance: {
      onTimeDelivery: 98.2,
      qualityScore: 4.9,
      responseTime: 1.8,
      totalOrders: 234,
      successfulOrders: 230,
      lastOrderDate: "2024-01-18T00:00:00Z"
    },
    certifications: ["ISO 9001:2015", "ISO 14001:2015", "GMP", "FDA Approved"],
    paymentTerms: "Net 45",
    deliveryTime: 5,
    isActive: true,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    createdBy: "1"
  },
  {
    id: "4",
    code: "SUP-004",
    name: "Chemical Solutions Inc",
    contactPerson: "Dr. Sarah Khan",
    email: "sarah@chemicalsolutions.com",
    phone: "+92-21-4567890",
    address: {
      street: "Plot 25, North Nazimabad",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postalCode: "74600"
    },
    rating: 3.8,
    performance: {
      onTimeDelivery: 82.1,
      qualityScore: 4.2,
      responseTime: 6.5,
      totalOrders: 67,
      successfulOrders: 55,
      lastOrderDate: "2024-01-05T00:00:00Z"
    },
    certifications: ["ISO 9001:2015"],
    paymentTerms: "Net 30",
    deliveryTime: 14,
    isActive: false,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
    createdBy: "1"
  }
]
