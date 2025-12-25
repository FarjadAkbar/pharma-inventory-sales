import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export enum DeviationSeverity {
  MINOR = 'Minor',
  MAJOR = 'Major',
  CRITICAL = 'Critical',
}

export enum DeviationCategory {
  QUALITY = 'Quality',
  SAFETY = 'Safety',
  COMPLIANCE = 'Compliance',
  PROCESS = 'Process',
  DOCUMENTATION = 'Documentation',
  EQUIPMENT = 'Equipment',
}

export enum DeviationStatus {
  OPEN = 'Open',
  UNDER_INVESTIGATION = 'Under Investigation',
  ROOT_CAUSE_IDENTIFIED = 'Root Cause Identified',
  CAPA_IN_PROGRESS = 'CAPA In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum DeviationSourceType {
  QC = 'QC',
  PRODUCTION = 'Production',
  WAREHOUSE = 'Warehouse',
  DISTRIBUTION = 'Distribution',
  CUSTOMER = 'Customer',
}

export class CreateQADeviationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(DeviationSeverity)
  severity: DeviationSeverity;

  @IsEnum(DeviationCategory)
  category: DeviationCategory;

  @IsEnum(DeviationSourceType)
  sourceType: DeviationSourceType;

  @IsNumber()
  sourceId: number;

  @IsString()
  sourceReference: string;

  @IsNumber()
  @IsOptional()
  materialId?: number;

  @IsString()
  @IsOptional()
  materialName?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsNumber()
  discoveredBy: number;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  rootCause?: string;

  @IsString()
  @IsOptional()
  immediateAction?: string;

  @IsString()
  @IsOptional()
  correctiveAction?: string;

  @IsString()
  @IsOptional()
  preventiveAction?: string;
}

export class UpdateQADeviationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DeviationSeverity)
  @IsOptional()
  severity?: DeviationSeverity;

  @IsEnum(DeviationCategory)
  @IsOptional()
  category?: DeviationCategory;

  @IsEnum(DeviationStatus)
  @IsOptional()
  status?: DeviationStatus;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  rootCause?: string;

  @IsString()
  @IsOptional()
  immediateAction?: string;

  @IsString()
  @IsOptional()
  correctiveAction?: string;

  @IsString()
  @IsOptional()
  preventiveAction?: string;

  @IsString()
  @IsOptional()
  effectivenessCheck?: string;
}

export class QADeviationResponseDto {
  id: number;
  deviationNumber: string;
  title: string;
  description: string;
  severity: DeviationSeverity;
  category: DeviationCategory;
  status: DeviationStatus;
  sourceType: DeviationSourceType;
  sourceId: number;
  sourceReference: string;
  materialId?: number;
  materialName?: string;
  batchNumber?: string;
  discoveredBy: number;
  discoveredByName?: string;
  discoveredAt: Date;
  assignedTo?: number;
  assignedToName?: string;
  assignedAt?: Date;
  dueDate?: Date;
  closedAt?: Date;
  rootCause?: string;
  immediateAction?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  effectivenessCheck?: string;
  createdAt: Date;
  updatedAt: Date;
}

