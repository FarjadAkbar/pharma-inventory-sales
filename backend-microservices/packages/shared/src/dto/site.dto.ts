import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum SiteType {
  HOSPITAL = 'hospital',
  CLINIC = 'clinic',
  PHARMACY = 'pharmacy',
  WAREHOUSE = 'warehouse',
  MANUFACTURING = 'manufacturing',
}

export class CreateSiteDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(SiteType)
  @IsOptional()
  type?: SiteType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSiteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(SiteType)
  @IsOptional()
  type?: SiteType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SiteResponseDto {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  type?: SiteType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

