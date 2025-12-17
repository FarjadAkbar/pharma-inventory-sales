import { IsString, IsOptional, IsNumber, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum RawMaterialStatus {
  ACTIVE = 'Active',
  INACTIVE = 'InActive',
}

export class CreateRawMaterialDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  grade?: string;

  @IsString()
  @IsOptional()
  storageRequirements?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  unitOfMeasure?: string;

  @IsNumber()
  supplierId: number;

  @IsEnum(RawMaterialStatus)
  @IsOptional()
  status?: RawMaterialStatus;
}

export class UpdateRawMaterialDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  grade?: string;

  @IsString()
  @IsOptional()
  storageRequirements?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  unitOfMeasure?: string;

  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsEnum(RawMaterialStatus)
  @IsOptional()
  status?: RawMaterialStatus;
}

export class RawMaterialResponseDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  grade?: string;
  storageRequirements?: string;
  unitOfMeasure?: string;
  supplierId: number;
  supplier?: {
    id: number;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
  status: RawMaterialStatus;
  createdAt: Date;
  updatedAt: Date;
}

