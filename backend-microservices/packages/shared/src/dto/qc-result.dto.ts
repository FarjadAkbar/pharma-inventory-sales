import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum QCResultStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export class TestResultValueDto {
  @IsNumber()
  testId: number;

  @IsString()
  parameter: string;

  @IsString()
  resultValue: string;

  @IsString()
  unit: string;

  @IsBoolean()
  passed: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CreateQCResultDto {
  @IsNumber()
  sampleId: number;

  @IsNumber()
  testId: number;

  @IsString()
  resultValue: string;

  @IsString()
  unit: string;

  @IsBoolean()
  passed: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  performedBy: number;

  @IsDateString()
  @IsOptional()
  performedAt?: string;
}

export class UpdateQCResultDto {
  @IsString()
  @IsOptional()
  resultValue?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsBoolean()
  @IsOptional()
  passed?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsEnum(QCResultStatus)
  @IsOptional()
  status?: QCResultStatus;
}

export class SubmitResultsToQADto {
  @IsNumber()
  sampleId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  resultIds: number[];

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  submittedBy: number;
}

export class QCResultResponseDto {
  id: number;
  sampleId: number;
  testId: number;
  testName?: string;
  testCode?: string;
  resultValue: string;
  unit: string;
  passed: boolean;
  status: QCResultStatus;
  remarks?: string;
  performedBy: number;
  performedByName?: string;
  performedAt: Date;
  submittedToQA: boolean;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

