import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum QAReleaseStatus {
  PENDING = 'Pending',
  CHECKLIST_IN_PROGRESS = 'Checklist In Progress',
  UNDER_REVIEW = 'Under Review',
  RELEASED = 'Released',
  HELD = 'Held',
  REJECTED = 'Rejected',
}

export enum QADecision {
  RELEASE = 'Release',
  HOLD = 'Hold',
  REJECT = 'Reject',
}

export class QAChecklistItemDto {
  @IsString()
  item: string;

  @IsBoolean()
  checked: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CreateQAReleaseDto {
  @IsNumber()
  sampleId: number;

  @IsNumber()
  goodsReceiptItemId: number;

  @IsNumber()
  materialId: number;

  @IsString()
  materialName: string;

  @IsString()
  materialCode: string;

  @IsString()
  batchNumber: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsArray()
  @IsNumber({}, { each: true })
  qcResultIds: number[];

  @IsNumber()
  submittedBy: number;
}

export class UpdateQAReleaseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QAChecklistItemDto)
  @IsOptional()
  checklistItems?: QAChecklistItemDto[];

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class MakeReleaseDecisionDto {
  @IsEnum(QADecision)
  decision: QADecision;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  decidedBy: number;

  @IsString()
  @IsOptional()
  eSignature?: string;
}

export class QAChecklistItemResponseDto {
  id: number;
  item: string;
  checked: boolean;
  remarks?: string;
}

export class QAReleaseResponseDto {
  id: number;
  releaseNumber: string;
  sampleId: number;
  goodsReceiptItemId: number;
  materialId: number;
  materialName: string;
  materialCode: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  status: QAReleaseStatus;
  decision?: QADecision;
  decisionReason?: string;
  checklistItems: QAChecklistItemResponseDto[];
  qcResultIds: number[];
  submittedBy: number;
  submittedByName?: string;
  submittedAt: Date;
  reviewedBy?: number;
  reviewedByName?: string;
  reviewedAt?: Date;
  decidedBy?: number;
  decidedByName?: string;
  decidedAt?: Date;
  eSignature?: string;
  remarks?: string;
  warehouseNotified: boolean;
  warehouseNotifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

