import { IsString, IsOptional, IsNumber, IsArray, IsEnum, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum QCTestStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export class TestSpecificationDto {
  @IsString()
  parameter: string;

  @IsString()
  @IsOptional()
  minValue?: string;

  @IsString()
  @IsOptional()
  maxValue?: string;

  @IsString()
  @IsOptional()
  targetValue?: string;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  method?: string;
}

export class CreateQCTestDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestSpecificationDto)
  specifications: TestSpecificationDto[];

  @IsEnum(QCTestStatus)
  @IsOptional()
  status?: QCTestStatus;
}

export class UpdateQCTestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestSpecificationDto)
  @IsOptional()
  specifications?: TestSpecificationDto[];

  @IsEnum(QCTestStatus)
  @IsOptional()
  status?: QCTestStatus;
}

export class TestSpecificationResponseDto {
  id: number;
  parameter: string;
  minValue?: string;
  maxValue?: string;
  targetValue?: string;
  unit: string;
  method?: string;
}

export class QCTestResponseDto {
  id: number;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  specifications: TestSpecificationResponseDto[];
  status: QCTestStatus;
  createdAt: Date;
  updatedAt: Date;
}

