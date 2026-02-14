import { IsString, IsOptional, IsNumber, IsEnum, IsObject, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

// Account Types
export enum AccountType {
  CUSTOMER = 'customer',
  DISTRIBUTOR = 'distributor',
  PARTNER = 'partner',
  VENDOR = 'vendor',
}

// Account Status
export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

// Create Account DTO
export class CreateAccountDto {
  @IsString()
  accountName: string;

  @IsString()
  accountCode: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  assignedSalesRep?: number;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsNumber()
  createdBy: number;
}

// Update Account DTO
export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsString()
  accountCode?: string;

  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  assignedSalesRep?: number;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// Account Response DTO
export class AccountResponseDto {
  id: number;
  accountNumber: string;
  accountName: string;
  accountCode: string;
  type: AccountType;
  status: AccountStatus;
  phone?: string;
  email?: string;
  billingAddress?: AddressDto;
  shippingAddress?: AddressDto;
  creditLimit?: number;
  paymentTerms?: string;
  assignedSalesRep?: number;
  assignedSalesRepName?: string;
  taxId?: string;
  registrationNumber?: string;
  notes?: string;
  tags?: string[];
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}
