import { IsString, IsOptional, IsNumber, IsArray, IsEmail, Min, Max, IsEnum, IsBoolean } from 'class-validator';

export enum SupplierStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export class CreateSupplierDto {
  @IsString()
  name: string;

  @IsString()
  contactPerson: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsEnum(SupplierStatus)
  @IsOptional()
  status?: SupplierStatus;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  siteIds?: number[];
}

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsEnum(SupplierStatus)
  @IsOptional()
  status?: SupplierStatus;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  siteIds?: number[];
}

export class SupplierResponseDto {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: SupplierStatus;
  siteIds?: number[];
  sites?: Array<{ id: number; name: string; address?: string; city?: string; type?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

