import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, Min, Max, ValidateNested, IsBoolean, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// Work Order Status
export enum WorkOrderStatus {
  DRAFT = 'Draft',
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

// Batch Status
export enum BatchStatus {
  DRAFT = 'Draft',
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  QC_PENDING = 'QC Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  FAILED = 'Failed',
}

// Batch Step Status
export enum BatchStepStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  SKIPPED = 'Skipped',
  FAILED = 'Failed',
}

// Material Consumption Status
export enum MaterialConsumptionStatus {
  PENDING = 'Pending',
  CONSUMED = 'Consumed',
  REJECTED = 'Rejected',
}

// BOM Status
export enum BOMStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
  OBSOLETE = 'Obsolete',
}

// Manufacturing Priority
export enum ManufacturingPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
  URGENT = 'Urgent',
}

// Work Order DTOs
export class CreateWorkOrderDto {
  @IsNumber()
  drugId: number;

  @IsString()
  drugName: string;

  @IsString()
  drugCode: string;

  @IsNumber()
  siteId: number;

  @IsString()
  siteName: string;

  @IsNumber()
  @Min(0)
  plannedQuantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  bomVersion: number;

  @IsEnum(WorkOrderStatus)
  @IsOptional()
  status?: WorkOrderStatus;

  @IsEnum(ManufacturingPriority)
  @IsOptional()
  priority?: ManufacturingPriority;

  @IsDateString()
  plannedStartDate: string;

  @IsDateString()
  plannedEndDate: string;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  createdBy: number;
}

export class UpdateWorkOrderDto {
  @IsNumber()
  @IsOptional()
  drugId?: number;

  @IsString()
  @IsOptional()
  drugName?: string;

  @IsString()
  @IsOptional()
  drugCode?: string;

  @IsNumber()
  @IsOptional()
  siteId?: number;

  @IsString()
  @IsOptional()
  siteName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  plannedQuantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  bomVersion?: number;

  @IsEnum(WorkOrderStatus)
  @IsOptional()
  status?: WorkOrderStatus;

  @IsEnum(ManufacturingPriority)
  @IsOptional()
  priority?: ManufacturingPriority;

  @IsDateString()
  @IsOptional()
  plannedStartDate?: string;

  @IsDateString()
  @IsOptional()
  plannedEndDate?: string;

  @IsDateString()
  @IsOptional()
  actualStartDate?: string;

  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class WorkOrderResponseDto {
  id: number;
  workOrderNumber: string;
  drugId: number;
  drugName: string;
  drugCode: string;
  siteId: number;
  siteName: string;
  plannedQuantity: number;
  unit: string;
  bomVersion: number;
  status: WorkOrderStatus;
  priority: ManufacturingPriority;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  assignedTo?: number;
  assignedToName?: string;
  createdBy: number;
  createdByName?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Batch DTOs
export class CreateBatchDto {
  @IsNumber()
  workOrderId: number;

  @IsString()
  workOrderNumber: string;

  @IsNumber()
  drugId: number;

  @IsString()
  drugName: string;

  @IsString()
  drugCode: string;

  @IsNumber()
  siteId: number;

  @IsString()
  siteName: string;

  @IsNumber()
  @Min(0)
  plannedQuantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  bomVersion: number;

  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;

  @IsEnum(ManufacturingPriority)
  @IsOptional()
  priority?: ManufacturingPriority;

  @IsDateString()
  plannedStartDate: string;

  @IsDateString()
  plannedEndDate: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  createdBy: number;
}

export class StartBatchDto {
  @IsNumber()
  startedBy: number;

  @IsDateString()
  @IsOptional()
  actualStartDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CompleteBatchDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualQuantity?: number;

  @IsBoolean()
  @IsOptional()
  hasFault?: boolean;

  @IsString()
  @IsOptional()
  faultDescription?: string;

  @IsNumber()
  completedBy: number;

  @IsDateString()
  @IsOptional()
  actualEndDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class SubmitBatchToQCDto {
  @IsString()
  faultDescription: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  requestedBy: number;
}

export class ReceiveFinishedGoodsDto {
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  batchNumber: string;

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
  receivedBy: number;
}

export class BatchResponseDto {
  id: number;
  batchNumber: string;
  workOrderId: number;
  workOrderNumber: string;
  drugId: number;
  drugName: string;
  drugCode: string;
  siteId: number;
  siteName: string;
  plannedQuantity: number;
  actualQuantity?: number;
  unit: string;
  bomVersion: number;
  status: BatchStatus;
  priority: ManufacturingPriority;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  startedBy?: number;
  startedByName?: string;
  startedAt?: Date;
  completedBy?: number;
  completedByName?: string;
  completedAt?: Date;
  hasFault?: boolean;
  faultDescription?: string;
  qcSampleId?: number;
  putawayId?: number;
  createdBy: number;
  createdByName?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Batch Step DTOs
export class ExecuteBatchStepDto {
  @IsNumber()
  stepNumber: number;

  @IsString()
  stepName: string;

  @IsString()
  instruction: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;

  @IsEnum(BatchStepStatus)
  @IsOptional()
  status?: BatchStepStatus;

  @IsString()
  @IsOptional()
  eSignature?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @IsNumber()
  performedBy: number;
}

export class BatchStepResponseDto {
  id: number;
  batchId: number;
  stepNumber: number;
  stepName: string;
  instruction: string;
  description?: string;
  parameters?: Record<string, any>;
  status: BatchStepStatus;
  performedBy?: number;
  performedByName?: string;
  performedAt?: Date;
  eSignature?: string;
  remarks?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Material Consumption DTOs
export class ConsumeMaterialDto {
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
  plannedQuantity: number;

  @IsNumber()
  @Min(0)
  actualQuantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @IsOptional()
  locationId?: number;

  @IsEnum(MaterialConsumptionStatus)
  @IsOptional()
  status?: MaterialConsumptionStatus;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  consumedBy: number;
}

export class UpdateMaterialConsumptionDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualQuantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  locationId?: number;

  @IsEnum(MaterialConsumptionStatus)
  @IsOptional()
  status?: MaterialConsumptionStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class MaterialConsumptionResponseDto {
  id: number;
  batchId: number;
  materialId: number;
  materialName: string;
  materialCode: string;
  batchNumber: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
  status: MaterialConsumptionStatus;
  locationId?: number;
  consumedAt: Date;
  consumedBy: number;
  consumedByName?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

// BOM DTOs
export class BOMItemDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsNumber()
  materialId: number;

  @IsString()
  materialName: string;

  @IsString()
  materialCode: string;

  @IsNumber()
  @Min(0)
  quantityPerBatch: number;

  @IsString()
  unitOfMeasure: string;

  @IsNumber()
  @IsOptional()
  tolerance?: number;

  @IsBoolean()
  @IsOptional()
  isCritical?: boolean;

  @IsNumber()
  sequence: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CreateBOMDto {
  @IsNumber()
  drugId: number;

  @IsString()
  drugName: string;

  @IsString()
  drugCode: string;

  @IsNumber()
  @Min(0)
  batchSize: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  yield?: number;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsEnum(BOMStatus)
  @IsOptional()
  status?: BOMStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BOMItemDto)
  items: BOMItemDto[];

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  createdBy: number;
}

export class UpdateBOMDto {
  @IsString()
  @IsOptional()
  drugName?: string;

  @IsString()
  @IsOptional()
  drugCode?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  batchSize?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  yield?: number;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsEnum(BOMStatus)
  @IsOptional()
  status?: BOMStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BOMItemDto)
  @IsOptional()
  items?: BOMItemDto[];

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class BOMResponseDto {
  id: number;
  bomNumber: string;
  drugId: number;
  drugName: string;
  drugCode: string;
  version: number;
  status: BOMStatus;
  batchSize: number;
  yield?: number;
  effectiveDate?: Date;
  expiryDate?: Date;
  createdBy: number;
  createdByName?: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: Date;
  remarks?: string;
  items: BOMItemDto[];
  createdAt: Date;
  updatedAt: Date;
}

