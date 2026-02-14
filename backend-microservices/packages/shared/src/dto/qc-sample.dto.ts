import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, Min, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum QCSampleStatus {
  PENDING = 'Pending',
  SAMPLE_RECEIVED = 'Sample Received',
  TESTS_ASSIGNED = 'Tests Assigned',
  TESTING_IN_PROGRESS = 'Testing In Progress',
  RESULTS_ENTERED = 'Results Entered',
  SUBMITTED_TO_QA = 'Submitted to QA',
  QC_COMPLETE = 'QC Complete',
}

export enum QCSamplePriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum QCSampleSourceType {
  GOODS_RECEIPT = 'GoodsReceipt',
  BATCH = 'Batch',
}

export class CreateQCSampleDto {
  @IsEnum(QCSampleSourceType)
  sourceType: QCSampleSourceType;

  @IsNumber()
  sourceId: number;

  @IsString()
  sourceReference: string;

  @IsNumber()
  @IsOptional()
  goodsReceiptItemId?: number;

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

  @IsEnum(QCSamplePriority)
  @IsOptional()
  priority?: QCSamplePriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  requestedBy: number;
}

export class UpdateQCSampleDto {
  @IsEnum(QCSampleStatus)
  @IsOptional()
  status?: QCSampleStatus;

  @IsEnum(QCSamplePriority)
  @IsOptional()
  priority?: QCSamplePriority;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class AssignTestsToSampleDto {
  @IsArray()
  @IsNumber({}, { each: true })
  testIds: number[];
}

export class QCSampleResponseDto {
  id: number;
  sampleCode: string;
  sourceType: QCSampleSourceType;
  sourceId: number;
  sourceReference: string;
  goodsReceiptItemId?: number;
  materialId: number;
  materialName: string;
  materialCode: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  priority: QCSamplePriority;
  status: QCSampleStatus;
  assignedTo?: number;
  requestedBy: number;
  requestedAt: Date;
  dueDate?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

