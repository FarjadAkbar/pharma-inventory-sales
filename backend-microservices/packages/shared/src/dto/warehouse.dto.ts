import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, Min, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// Inventory Status
export enum InventoryStatus {
  AVAILABLE = 'Available',
  QUARANTINE = 'Quarantine',
  HOLD = 'Hold',
  REJECTED = 'Rejected',
  RESERVED = 'Reserved',
  IN_TRANSIT = 'In Transit',
}

// Stock Movement Types
export enum StockMovementType {
  RECEIPT = 'Receipt',
  TRANSFER = 'Transfer',
  CONSUMPTION = 'Consumption',
  SHIPMENT = 'Shipment',
  ADJUSTMENT = 'Adjustment',
  ISSUE = 'Issue',
  RETURN = 'Return',
}

// Putaway Status
export enum PutawayStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

// Material Issue Status
export enum MaterialIssueStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  PICKED = 'Picked',
  ISSUED = 'Issued',
  CANCELLED = 'Cancelled',
}

// Inventory Item DTOs
export class CreateInventoryItemDto {
  @IsNumber()
  materialId: number;

  @IsString()
  materialName: string;

  @IsString()
  materialCode: string;

  @IsString()
  batchNumber: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsString()
  @IsOptional()
  rack?: string;

  @IsString()
  @IsOptional()
  shelf?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  @IsOptional()
  goodsReceiptItemId?: number;

  @IsNumber()
  @IsOptional()
  qaReleaseId?: number;
}

export class UpdateInventoryItemDto {
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsString()
  @IsOptional()
  rack?: string;

  @IsString()
  @IsOptional()
  shelf?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  @IsOptional()
  lastUpdatedBy?: number;
}

export class InventoryItemResponseDto {
  id: number;
  itemCode: string;
  materialId: number;
  materialName: string;
  materialCode: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  locationId?: string;
  zone?: string;
  rack?: string;
  shelf?: string;
  position?: string;
  status: InventoryStatus;
  expiryDate?: Date;
  temperature?: number;
  humidity?: number;
  goodsReceiptItemId?: number;
  qaReleaseId?: number;
  remarks?: string;
  lastUpdated?: Date;
  lastUpdatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Stock Movement DTOs
export class CreateStockMovementDto {
  @IsEnum(StockMovementType)
  movementType: StockMovementType;

  @IsNumber()
  materialId: number;

  @IsString()
  @IsOptional()
  materialName?: string;

  @IsString()
  @IsOptional()
  materialCode?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  fromLocationId?: string;

  @IsString()
  @IsOptional()
  toLocationId?: string;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  performedBy: number;
}

export class StockMovementResponseDto {
  id: number;
  movementNumber: string;
  movementType: StockMovementType;
  materialId: number;
  materialName?: string;
  materialCode?: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  fromLocationId?: string;
  toLocationId?: string;
  referenceId?: string;
  referenceType?: string;
  remarks?: string;
  performedBy: number;
  performedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Putaway DTOs
export class CreatePutawayItemDto {
  @IsNumber()
  materialId: number;

  @IsString()
  materialName: string;

  @IsString()
  materialCode: string;

  @IsString()
  batchNumber: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @IsOptional()
  goodsReceiptItemId?: number;

  @IsNumber()
  @IsOptional()
  qaReleaseId?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  requestedBy: number;
}

export class AssignPutawayLocationDto {
  @IsString()
  locationId: string;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsString()
  @IsOptional()
  rack?: string;

  @IsString()
  @IsOptional()
  shelf?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  assignedBy: number;
}

export class PutawayItemResponseDto {
  id: number;
  putawayNumber: string;
  materialId: number;
  materialName: string;
  materialCode: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  status: PutawayStatus;
  locationId?: string;
  zone?: string;
  rack?: string;
  shelf?: string;
  position?: string;
  temperature?: number;
  humidity?: number;
  goodsReceiptItemId?: number;
  qaReleaseId?: number;
  requestedBy: number;
  requestedAt: Date;
  assignedBy?: number;
  assignedAt?: Date;
  completedBy?: number;
  completedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Material Issue DTOs
export class CreateMaterialIssueDto {
  @IsNumber()
  materialId: number;

  @IsString()
  materialName: string;

  @IsString()
  materialCode: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  fromLocationId?: string;

  @IsString()
  @IsOptional()
  toLocationId?: string;

  @IsString()
  @IsOptional()
  workOrderId?: string;

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  requestedBy: number;
}

export class ApproveMaterialIssueDto {
  @IsNumber()
  approvedBy: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class MaterialIssueResponseDto {
  id: number;
  issueNumber: string;
  materialId: number;
  materialName: string;
  materialCode: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  fromLocationId?: string;
  toLocationId?: string;
  workOrderId?: string;
  batchId?: string;
  referenceId?: string;
  referenceType?: string;
  status: MaterialIssueStatus;
  requestedBy: number;
  requestedAt: Date;
  approvedBy?: number;
  approvedAt?: Date;
  pickedBy?: number;
  pickedAt?: Date;
  issuedBy?: number;
  issuedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Verify Items DTO
export class VerifyInventoryDto {
  @IsNumber()
  inventoryItemId: number;

  @IsNumber()
  @IsOptional()
  verifiedQuantity?: number;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsBoolean()
  @IsOptional()
  locationVerified?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  verifiedBy: number;
}

export class VerifyInventoryResponseDto {
  id: number;
  inventoryItemId: number;
  verifiedQuantity?: number;
  locationId?: string;
  locationVerified?: boolean;
  remarks?: string;
  verifiedBy: number;
  verifiedAt: Date;
  discrepancies?: {
    quantityDifference?: number;
    locationMismatch?: boolean;
  };
}

// Warehouse DTOs
export enum WarehouseType {
  MAIN = 'Main',
  DISTRIBUTION = 'Distribution',
  COLD_STORAGE = 'Cold Storage',
  QUARANTINE = 'Quarantine',
  HOLD = 'Hold',
}

export enum WarehouseStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  MAINTENANCE = 'Maintenance',
}

export class CreateWarehouseDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(WarehouseType)
  @IsOptional()
  type?: WarehouseType;

  @IsEnum(WarehouseStatus)
  @IsOptional()
  status?: WarehouseStatus;

  @IsNumber()
  @IsOptional()
  siteId?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsNumber()
  @IsOptional()
  minTemperature?: number;

  @IsNumber()
  @IsOptional()
  maxTemperature?: number;

  @IsNumber()
  @IsOptional()
  minHumidity?: number;

  @IsNumber()
  @IsOptional()
  maxHumidity?: number;

  @IsNumber()
  @IsOptional()
  managerId?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateWarehouseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(WarehouseType)
  @IsOptional()
  type?: WarehouseType;

  @IsEnum(WarehouseStatus)
  @IsOptional()
  status?: WarehouseStatus;

  @IsNumber()
  @IsOptional()
  siteId?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsNumber()
  @IsOptional()
  minTemperature?: number;

  @IsNumber()
  @IsOptional()
  maxTemperature?: number;

  @IsNumber()
  @IsOptional()
  minHumidity?: number;

  @IsNumber()
  @IsOptional()
  maxHumidity?: number;

  @IsNumber()
  @IsOptional()
  managerId?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class WarehouseResponseDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: WarehouseType;
  status: WarehouseStatus;
  siteId?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  minTemperature?: number;
  maxTemperature?: number;
  minHumidity?: number;
  maxHumidity?: number;
  managerId?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Storage Location DTOs
export enum LocationType {
  BIN = 'Bin',
  RACK = 'Rack',
  SHELF = 'Shelf',
  PALLET = 'Pallet',
  BULK = 'Bulk',
  COLD_ROOM = 'Cold Room',
  FREEZER = 'Freezer',
}

export enum LocationStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  RESERVED = 'Reserved',
  BLOCKED = 'Blocked',
  MAINTENANCE = 'Maintenance',
}

export class CreateStorageLocationDto {
  @IsString()
  locationCode: string;

  @IsNumber()
  warehouseId: number;

  @IsString()
  name: string;

  @IsEnum(LocationType)
  @IsOptional()
  type?: LocationType;

  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsString()
  @IsOptional()
  aisle?: string;

  @IsString()
  @IsOptional()
  rack?: string;

  @IsString()
  @IsOptional()
  shelf?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  capacityUnit?: string;

  @IsNumber()
  @IsOptional()
  minTemperature?: number;

  @IsNumber()
  @IsOptional()
  maxTemperature?: number;

  @IsNumber()
  @IsOptional()
  minHumidity?: number;

  @IsNumber()
  @IsOptional()
  maxHumidity?: number;

  @IsBoolean()
  @IsOptional()
  requiresTemperatureControl?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresHumidityControl?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateStorageLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(LocationType)
  @IsOptional()
  type?: LocationType;

  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsString()
  @IsOptional()
  aisle?: string;

  @IsString()
  @IsOptional()
  rack?: string;

  @IsString()
  @IsOptional()
  shelf?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  capacityUnit?: string;

  @IsNumber()
  @IsOptional()
  minTemperature?: number;

  @IsNumber()
  @IsOptional()
  maxTemperature?: number;

  @IsNumber()
  @IsOptional()
  minHumidity?: number;

  @IsNumber()
  @IsOptional()
  maxHumidity?: number;

  @IsBoolean()
  @IsOptional()
  requiresTemperatureControl?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresHumidityControl?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class StorageLocationResponseDto {
  id: number;
  locationCode: string;
  warehouseId: number;
  name: string;
  type: LocationType;
  status: LocationStatus;
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  position?: string;
  capacity?: number;
  capacityUnit?: string;
  minTemperature?: number;
  maxTemperature?: number;
  minHumidity?: number;
  maxHumidity?: number;
  requiresTemperatureControl: boolean;
  requiresHumidityControl: boolean;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cycle Count DTOs
export enum CycleCountStatus {
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum CycleCountType {
  FULL = 'Full',
  PARTIAL = 'Partial',
  RANDOM = 'Random',
  ABC = 'ABC',
  LOCATION_BASED = 'Location Based',
}

export class CreateCycleCountDto {
  @IsEnum(CycleCountType)
  @IsOptional()
  countType?: CycleCountType;

  @IsNumber()
  @IsOptional()
  warehouseId?: number;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsNumber()
  @IsOptional()
  materialId?: number;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsNumber()
  @IsOptional()
  expectedQuantity?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateCycleCountDto {
  @IsEnum(CycleCountStatus)
  @IsOptional()
  status?: CycleCountStatus;

  @IsNumber()
  @IsOptional()
  countedQuantity?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  adjustmentReason?: string;

  @IsNumber()
  @IsOptional()
  performedBy?: number;
}

export class CycleCountResponseDto {
  id: number;
  countNumber: string;
  countType: CycleCountType;
  status: CycleCountStatus;
  warehouseId?: number;
  locationId?: string;
  zone?: string;
  materialId?: number;
  batchNumber?: string;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: number;
  performedBy?: number;
  expectedQuantity?: number;
  countedQuantity?: number;
  variance?: number;
  variancePercentage?: number;
  hasVariance: boolean;
  remarks?: string;
  adjustmentReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Temperature Log DTOs
export enum TemperatureLogType {
  WAREHOUSE = 'Warehouse',
  LOCATION = 'Location',
  INVENTORY_ITEM = 'Inventory Item',
  PUTAWAY = 'Putaway',
}

export enum TemperatureStatus {
  NORMAL = 'Normal',
  WARNING = 'Warning',
  CRITICAL = 'Critical',
  OUT_OF_RANGE = 'Out of Range',
}

export class CreateTemperatureLogDto {
  @IsEnum(TemperatureLogType)
  logType: TemperatureLogType;

  @IsNumber()
  @IsOptional()
  warehouseId?: number;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsNumber()
  @IsOptional()
  inventoryItemId?: number;

  @IsNumber()
  @IsOptional()
  putawayItemId?: number;

  @IsNumber()
  temperature: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;

  @IsNumber()
  @IsOptional()
  minThreshold?: number;

  @IsNumber()
  @IsOptional()
  maxThreshold?: number;

  @IsString()
  @IsOptional()
  sensorId?: string;

  @IsString()
  @IsOptional()
  sensorName?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  @IsOptional()
  loggedBy?: number;
}

export class TemperatureLogResponseDto {
  id: number;
  logType: TemperatureLogType;
  warehouseId?: number;
  locationId?: string;
  inventoryItemId?: number;
  putawayItemId?: number;
  temperature: number;
  humidity?: number;
  status: TemperatureStatus;
  minThreshold?: number;
  maxThreshold?: number;
  isOutOfRange: boolean;
  sensorId?: string;
  sensorName?: string;
  remarks?: string;
  loggedAt: Date;
  loggedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Label & Barcode DTOs
export enum LabelType {
  INVENTORY_ITEM = 'Inventory Item',
  PUTAWAY = 'Putaway',
  MATERIAL_ISSUE = 'Material Issue',
  CYCLE_COUNT = 'Cycle Count',
  LOCATION = 'Location',
  BATCH = 'Batch',
}

export enum BarcodeType {
  CODE128 = 'CODE128',
  CODE39 = 'CODE39',
  EAN13 = 'EAN13',
  QR_CODE = 'QR Code',
  DATA_MATRIX = 'Data Matrix',
}

export class CreateLabelBarcodeDto {
  @IsEnum(LabelType)
  labelType: LabelType;

  @IsNumber()
  @IsOptional()
  referenceId?: number;

  @IsString()
  @IsOptional()
  referenceType?: string;

  @IsNumber()
  @IsOptional()
  inventoryItemId?: number;

  @IsNumber()
  @IsOptional()
  putawayItemId?: number;

  @IsNumber()
  @IsOptional()
  materialIssueId?: number;

  @IsNumber()
  @IsOptional()
  cycleCountId?: number;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsEnum(BarcodeType)
  @IsOptional()
  barcodeType?: BarcodeType;

  @IsString()
  @IsOptional()
  labelData?: string;

  @IsString()
  @IsOptional()
  labelTemplate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateLabelBarcodeDto {
  @IsString()
  @IsOptional()
  labelData?: string;

  @IsString()
  @IsOptional()
  labelTemplate?: string;

  @IsBoolean()
  @IsOptional()
  isPrinted?: boolean;

  @IsNumber()
  @IsOptional()
  printedBy?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class PrintLabelBarcodeDto {
  @IsNumber()
  printedBy: number;

  @IsString()
  @IsOptional()
  printerName?: string;

  @IsNumber()
  @IsOptional()
  copies?: number;
}

export class LabelBarcodeResponseDto {
  id: number;
  barcode: string;
  labelType: LabelType;
  referenceId?: number;
  referenceType?: string;
  inventoryItemId?: number;
  putawayItemId?: number;
  materialIssueId?: number;
  cycleCountId?: number;
  locationId?: string;
  batchNumber?: string;
  barcodeType: BarcodeType;
  labelData?: string;
  labelTemplate?: string;
  isPrinted: boolean;
  printedAt?: Date;
  printedBy?: number;
  printCount: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

