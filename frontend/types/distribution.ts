// Distribution & Sales Module Types

export interface SalesOrder {
  id: string
  orderNumber: string
  accountId: string
  accountName: string
  accountCode: string
  siteId: string
  siteName: string
  requestedShipDate: string
  actualShipDate?: string
  deliveryDate?: string
  status: SalesOrderStatus
  priority: DistributionPriority
  totalAmount: number
  currency: string
  specialInstructions?: string
  items: SalesOrderItem[]
  shippingAddress: ShippingAddress
  billingAddress: BillingAddress
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  remarks?: string
}

export interface SalesOrderItem {
  id: string
  drugId: string
  drugName: string
  drugCode: string
  batchPreference: 'FEFO' | 'Specific'
  preferredBatchId?: string
  preferredBatchNumber?: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  allocatedQuantity: number
  allocatedBatches: AllocatedBatch[]
  status: 'Pending' | 'Allocated' | 'Picked' | 'Shipped' | 'Delivered'
  remarks?: string
}

export interface AllocatedBatch {
  id: string
  batchNumber: string
  quantity: number
  unit: string
  expiryDate: string
  location: string
  allocatedAt: string
  allocatedBy: string
  allocatedByName: string
}

export interface Shipment {
  id: string
  shipmentNumber: string
  salesOrderId: string
  salesOrderNumber: string
  accountId: string
  accountName: string
  siteId: string
  siteName: string
  status: ShipmentStatus
  priority: DistributionPriority
  shipmentDate: string
  expectedDeliveryDate: string
  actualDeliveryDate?: string
  trackingNumber?: string
  carrier: string
  serviceType: string
  packagingInstructions: PackagingInstruction[]
  items: ShipmentItem[]
  shippingAddress: ShippingAddress
  specialHandling: SpecialHandling[]
  temperatureRequirements: TemperatureRequirement
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  remarks?: string
}

export interface ShipmentItem {
  id: string
  drugId: string
  drugName: string
  drugCode: string
  batchNumber: string
  quantity: number
  unit: string
  location: string
  pickedQuantity: number
  packedQuantity: number
  status: 'Pending' | 'Picked' | 'Packed' | 'Shipped' | 'Delivered'
  pickedBy?: string
  pickedByName?: string
  pickedAt?: string
  packedBy?: string
  packedByName?: string
  packedAt?: string
  remarks?: string
}

export interface PackagingInstruction {
  id: string
  drugId: string
  drugName: string
  packagingType: string
  quantity: number
  unit: string
  specialRequirements: string[]
  temperatureRange: {
    min: number
    max: number
    unit: string
  }
  handlingInstructions: string
}

export interface SpecialHandling {
  id: string
  type: 'Fragile' | 'Hazardous' | 'Temperature Sensitive' | 'Light Sensitive' | 'Other'
  description: string
  instructions: string
  required: boolean
}

export interface TemperatureRequirement {
  minTemperature: number
  maxTemperature: number
  unit: string
  monitoringRequired: boolean
  alertThreshold: number
}

export interface ColdChainRecord {
  id: string
  shipmentId: string
  shipmentNumber: string
  drugId: string
  drugName: string
  batchNumber: string
  temperature: number
  humidity: number
  location: string
  timestamp: string
  sensorId: string
  status: 'Normal' | 'Warning' | 'Alert' | 'Critical'
  remarks?: string
}

export interface TemperatureExcursion {
  id: string
  excursionNumber: string
  shipmentId: string
  shipmentNumber: string
  drugId: string
  drugName: string
  batchNumber: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Active' | 'Acknowledged' | 'Resolved' | 'Closed'
  minTemperature: number
  maxTemperature: number
  actualTemperature: number
  duration: number
  unit: string
  detectedAt: string
  acknowledgedBy?: string
  acknowledgedByName?: string
  acknowledgedAt?: string
  resolvedBy?: string
  resolvedByName?: string
  resolvedAt?: string
  correctiveActions: string[]
  remarks?: string
}

export interface ProofOfDelivery {
  id: string
  podNumber: string
  shipmentId: string
  shipmentNumber: string
  salesOrderId: string
  salesOrderNumber: string
  accountId: string
  accountName: string
  deliveryDate: string
  deliveryTime: string
  deliveredBy: string
  deliveredByName: string
  receivedBy: string
  receivedByName: string
  receivedByTitle: string
  signature: string
  deliveryStatus: 'Delivered' | 'Partial' | 'Rejected' | 'Damaged' | 'Returned'
  deliveryNotes: string
  photos: PODPhoto[]
  temperatureAtDelivery: number
  conditionAtDelivery: 'Good' | 'Damaged' | 'Compromised'
  exceptions: DeliveryException[]
  createdBy: string
  createdByName: string
  createdAt: string
  remarks?: string
}

export interface PODPhoto {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  category: 'Delivery' | 'Damage' | 'Temperature' | 'Signature' | 'Other'
  takenAt: string
  takenBy: string
  takenByName: string
  description?: string
}

export interface DeliveryException {
  id: string
  type: 'Damaged Goods' | 'Wrong Quantity' | 'Wrong Product' | 'Temperature Excursion' | 'Late Delivery' | 'Other'
  description: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  reportedBy: string
  reportedByName: string
  reportedAt: string
  resolvedBy?: string
  resolvedByName?: string
  resolvedAt?: string
  resolution?: string
  photos: PODPhoto[]
}

export interface CustomerAccount {
  id: string
  accountCode: string
  accountName: string
  accountType: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Distributor' | 'Government' | 'Other'
  status: 'Active' | 'Inactive' | 'Suspended' | 'Blacklisted'
  contactPerson: string
  email: string
  phone: string
  address: Address
  creditLimit: number
  paymentTerms: string
  deliveryInstructions: string
  specialRequirements: string[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  remarks?: string
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface ShippingAddress extends Address {
  contactPerson: string
  phone: string
  email: string
  deliveryInstructions: string
}

export interface BillingAddress extends Address {
  contactPerson: string
  phone: string
  email: string
  taxId: string
}

export interface PickList {
  id: string
  pickListNumber: string
  shipmentId: string
  shipmentNumber: string
  warehouseId: string
  warehouseName: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  priority: DistributionPriority
  assignedTo: string
  assignedToName: string
  assignedAt: string
  startedAt?: string
  completedAt?: string
  items: PickListItem[]
  createdBy: string
  createdByName: string
  createdAt: string
  remarks?: string
}

export interface PickListItem {
  id: string
  drugId: string
  drugName: string
  drugCode: string
  batchNumber: string
  location: string
  zone: string
  rack: string
  shelf: string
  position: string
  requiredQuantity: number
  pickedQuantity: number
  unit: string
  expiryDate: string
  status: 'Pending' | 'Picked' | 'Short' | 'Damaged'
  pickedBy?: string
  pickedByName?: string
  pickedAt?: string
  remarks?: string
}

export interface DistributionRoute {
  id: string
  routeCode: string
  routeName: string
  startLocation: string
  endLocation: string
  distance: number
  unit: string
  estimatedDuration: number
  unit: string
  isActive: boolean
  stops: RouteStop[]
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface RouteStop {
  id: string
  stopNumber: number
  accountId: string
  accountName: string
  address: Address
  estimatedArrival: string
  actualArrival?: string
  estimatedDeparture: string
  actualDeparture?: string
  status: 'Pending' | 'In Transit' | 'Arrived' | 'Completed' | 'Skipped'
  remarks?: string
}

// Enums
export type SalesOrderStatus = 
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'In Progress'
  | 'Allocated'
  | 'Picked'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'

export type ShipmentStatus = 
  | 'Draft'
  | 'Pending'
  | 'In Progress'
  | 'Picked'
  | 'Packed'
  | 'Shipped'
  | 'In Transit'
  | 'Delivered'
  | 'Returned'
  | 'Cancelled'

export type DistributionPriority = 
  | 'Low'
  | 'Normal'
  | 'High'
  | 'Urgent'
  | 'Emergency'

// Filter Types
export interface SalesOrderFilters {
  search?: string
  accountId?: string
  status?: SalesOrderStatus
  priority?: DistributionPriority
  siteId?: string
  dateFrom?: string
  dateTo?: string
  createdBy?: string
}

export interface ShipmentFilters {
  search?: string
  status?: ShipmentStatus
  priority?: DistributionPriority
  siteId?: string
  carrier?: string
  dateFrom?: string
  dateTo?: string
  createdBy?: string
}

export interface PODFilters {
  search?: string
  deliveryStatus?: string
  accountId?: string
  dateFrom?: string
  dateTo?: string
  deliveredBy?: string
}

// API Response Types
export interface DistributionAPIResponse<T> {
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
export interface DistributionDashboardStats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  inProgressOrders: number
  shippedOrders: number
  deliveredOrders: number
  totalShipments: number
  pendingShipments: number
  inTransitShipments: number
  deliveredShipments: number
  totalPODs: number
  pendingPODs: number
  completedPODs: number
  averageDeliveryTime: number
  onTimeDeliveryRate: number
  customerSatisfactionScore: number
}

// Sales Analytics
export interface SalesAnalytics {
  period: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  topProducts: Array<{
    drugId: string
    drugName: string
    quantity: number
    revenue: number
  }>
  topCustomers: Array<{
    accountId: string
    accountName: string
    orderCount: number
    revenue: number
  }>
  orderTrends: Array<{
    date: string
    orders: number
    revenue: number
  }>
}

// Distribution Performance Metrics
export interface DistributionMetrics {
  onTimeDelivery: number
  orderAccuracy: number
  customerSatisfaction: number
  averageDeliveryTime: number
  temperatureCompliance: number
  damageRate: number
  returnRate: number
  costPerDelivery: number
}
