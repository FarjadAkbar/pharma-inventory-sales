// Warehouse Operations Module Types

export interface InventoryItem {
  id: string
  itemCode: string
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  expiryDate: string
  quantity: number
  unit: string
  location: string
  zone: string
  rack: string
  shelf: string
  position: string
  status: InventoryStatus
  temperature: number
  humidity: number
  lastUpdated: string
  lastUpdatedBy: string
  lastUpdatedByName: string
  remarks?: string
}

export interface PutawayTask {
  id: string
  taskNumber: string
  grnId: string
  grnNumber: string
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  quantity: number
  unit: string
  status: PutawayStatus
  priority: WarehousePriority
  assignedTo: string
  assignedToName: string
  assignedAt: string
  startedAt?: string
  completedAt?: string
  sourceLocation: string
  targetLocation?: string
  targetZone?: string
  targetRack?: string
  targetShelf?: string
  targetPosition?: string
  temperatureCompliance: boolean
  createdBy: string
  createdByName: string
  createdAt: string
  remarks?: string
}

export interface MovementRecord {
  id: string
  movementNumber: string
  movementType: MovementType
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  quantity: number
  unit: string
  fromLocation: string
  toLocation: string
  fromZone: string
  toZone: string
  fromRack: string
  toRack: string
  fromShelf: string
  toShelf: string
  fromPosition: string
  toPosition: string
  reason: string
  performedBy: string
  performedByName: string
  performedAt: string
  referenceDocument?: string
  referenceNumber?: string
  remarks?: string
}

export interface CycleCount {
  id: string
  countNumber: string
  countType: CycleCountType
  status: CycleCountStatus
  zone: string
  assignedTo: string
  assignedToName: string
  scheduledDate: string
  startedAt?: string
  completedAt?: string
  items: CycleCountItem[]
  totalItems: number
  countedItems: number
  varianceItems: number
  createdBy: string
  createdByName: string
  createdAt: string
  remarks?: string
}

export interface CycleCountItem {
  id: string
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  systemQuantity: number
  countedQuantity: number
  variance: number
  variancePercentage: number
  status: 'Pending' | 'Counted' | 'Variance' | 'Verified'
  countedBy?: string
  countedByName?: string
  countedAt?: string
  verifiedBy?: string
  verifiedByName?: string
  verifiedAt?: string
  remarks?: string
}

export interface WarehouseLocation {
  id: string
  locationCode: string
  zone: string
  rack: string
  shelf: string
  position: string
  capacity: number
  unit: string
  temperature: number
  humidity: number
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Out of Service'
  materialType: string[]
  lastUpdated: string
  lastUpdatedBy: string
  lastUpdatedByName: string
  remarks?: string
}

export interface WarehouseZone {
  id: string
  zoneCode: string
  zoneName: string
  temperature: number
  humidity: number
  capacity: number
  unit: string
  materialTypes: string[]
  isActive: boolean
  locations: WarehouseLocation[]
}

export interface StockAdjustment {
  id: string
  adjustmentNumber: string
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  location: string
  systemQuantity: number
  actualQuantity: number
  adjustmentQuantity: number
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  requestedBy: string
  requestedByName: string
  requestedAt: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  remarks?: string
}

export interface TemperatureAlert {
  id: string
  alertNumber: string
  location: string
  zone: string
  materialId: string
  materialName: string
  batchNumber: string
  currentTemperature: number
  minTemperature: number
  maxTemperature: number
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Active' | 'Acknowledged' | 'Resolved'
  triggeredAt: string
  acknowledgedBy?: string
  acknowledgedByName?: string
  acknowledgedAt?: string
  resolvedBy?: string
  resolvedByName?: string
  resolvedAt?: string
  remarks?: string
}

export interface WarehousePersonnel {
  id: string
  name: string
  email: string
  role: string
  certifications: string[]
  isActive: boolean
  currentTasks: number
  maxTasks: number
  assignedZones: string[]
}

// Enums
export type InventoryStatus = 
  | 'Available'
  | 'Quarantine'
  | 'Hold'
  | 'Rejected'
  | 'Reserved'
  | 'In Transit'

export type PutawayStatus = 
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'

export type MovementType = 
  | 'Receipt'
  | 'Transfer'
  | 'Consumption'
  | 'Shipment'
  | 'Adjustment'
  | 'Cycle Count'
  | 'Putaway'
  | 'Picking'

export type CycleCountType = 
  | 'Full Count'
  | 'Partial Count'
  | 'ABC Count'
  | 'Random Count'
  | 'Location Count'

export type CycleCountStatus = 
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'

export type WarehousePriority = 
  | 'Low'
  | 'Normal'
  | 'High'
  | 'Urgent'

// Filter Types
export interface InventoryFilters {
  search?: string
  materialId?: string
  status?: InventoryStatus
  zone?: string
  location?: string
  expiryDateFrom?: string
  expiryDateTo?: string
  temperatureMin?: number
  temperatureMax?: number
}

export interface PutawayFilters {
  search?: string
  status?: PutawayStatus
  priority?: WarehousePriority
  assignedTo?: string
  zone?: string
  dateFrom?: string
  dateTo?: string
}

export interface MovementFilters {
  search?: string
  movementType?: MovementType
  materialId?: string
  fromLocation?: string
  toLocation?: string
  performedBy?: string
  dateFrom?: string
  dateTo?: string
}

export interface CycleCountFilters {
  search?: string
  countType?: CycleCountType
  status?: CycleCountStatus
  assignedTo?: string
  zone?: string
  dateFrom?: string
  dateTo?: string
}

// API Response Types
export interface WarehouseAPIResponse<T> {
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
export interface WarehouseDashboardStats {
  totalItems: number
  availableItems: number
  quarantineItems: number
  holdItems: number
  rejectedItems: number
  totalLocations: number
  occupiedLocations: number
  availableLocations: number
  pendingPutaway: number
  inProgressPutaway: number
  completedPutaway: number
  totalMovements: number
  pendingCycleCounts: number
  activeAlerts: number
  averagePutawayTime: number
  inventoryAccuracy: number
}

// FEFO (First Expired First Out) Management
export interface FEFOItem {
  id: string
  materialId: string
  materialName: string
  materialCode: string
  batchNumber: string
  expiryDate: string
  quantity: number
  unit: string
  location: string
  daysToExpiry: number
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Available' | 'Reserved' | 'In Transit'
}

// Location Management
export interface LocationCapacity {
  locationId: string
  locationCode: string
  totalCapacity: number
  usedCapacity: number
  availableCapacity: number
  utilizationPercentage: number
  materialType: string
}

// Stock Movement Analytics
export interface MovementAnalytics {
  period: string
  totalMovements: number
  receiptMovements: number
  transferMovements: number
  consumptionMovements: number
  shipmentMovements: number
  adjustmentMovements: number
  averageMovementTime: number
  topMovingMaterials: Array<{
    materialId: string
    materialName: string
    movementCount: number
  }>
}

// Warehouse Performance Metrics
export interface WarehouseMetrics {
  putawayAccuracy: number
  pickingAccuracy: number
  cycleCountAccuracy: number
  averagePutawayTime: number
  averagePickingTime: number
  inventoryTurnover: number
  spaceUtilization: number
  temperatureCompliance: number
  onTimeDelivery: number
}
