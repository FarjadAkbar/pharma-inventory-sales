import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, Min, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

// Sales Order Status
export enum SalesOrderStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  IN_PROGRESS = 'In Progress',
  ALLOCATED = 'Allocated',
  PICKED = 'Picked',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  RETURNED = 'Returned',
}

// Distribution Priority
export enum DistributionPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
  URGENT = 'Urgent',
  EMERGENCY = 'Emergency',
}

// Sales Order Item Status
export enum SalesOrderItemStatus {
  PENDING = 'Pending',
  ALLOCATED = 'Allocated',
  PICKED = 'Picked',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
}

// Shipping Address DTO (extends base AddressDto)
export class ShippingAddressDto extends AddressDto {
  @IsString()
  contactPerson: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  deliveryInstructions?: string;
}

export class BillingAddressDto extends AddressDto {
  @IsString()
  contactPerson: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  taxId: string;
}

// Sales Order Item DTOs
export class SalesOrderItemDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsNumber()
  drugId: number;

  @IsString()
  drugName: string;

  @IsString()
  drugCode: string;

  @IsEnum(['FEFO', 'Specific'])
  @IsOptional()
  batchPreference?: 'FEFO' | 'Specific';

  @IsNumber()
  @IsOptional()
  preferredBatchId?: number;

  @IsString()
  @IsOptional()
  preferredBatchNumber?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CreateSalesOrderDto {
  @IsNumber()
  accountId: number;

  @IsString()
  accountName: string;

  @IsString()
  accountCode: string;

  @IsNumber()
  siteId: number;

  @IsString()
  siteName: string;

  @IsDateString()
  requestedShipDate: string;

  @IsEnum(DistributionPriority)
  @IsOptional()
  priority?: DistributionPriority;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items: SalesOrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress: BillingAddressDto;

  @IsNumber()
  createdBy: number;
}

export class UpdateSalesOrderDto {
  @IsString()
  @IsOptional()
  accountName?: string;

  @IsString()
  @IsOptional()
  accountCode?: string;

  @IsString()
  @IsOptional()
  siteName?: string;

  @IsDateString()
  @IsOptional()
  requestedShipDate?: string;

  @IsDateString()
  @IsOptional()
  actualShipDate?: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;

  @IsEnum(SalesOrderStatus)
  @IsOptional()
  status?: SalesOrderStatus;

  @IsEnum(DistributionPriority)
  @IsOptional()
  priority?: DistributionPriority;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  @IsOptional()
  items?: SalesOrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsOptional()
  shippingAddress?: ShippingAddressDto;

  @ValidateNested()
  @Type(() => BillingAddressDto)
  @IsOptional()
  billingAddress?: BillingAddressDto;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class SalesOrderResponseDto {
  id: number;
  orderNumber: string;
  accountId: number;
  accountName: string;
  accountCode: string;
  siteId: number;
  siteName: string;
  requestedShipDate: Date;
  actualShipDate?: Date;
  deliveryDate?: Date;
  status: SalesOrderStatus;
  priority: DistributionPriority;
  totalAmount: number;
  currency: string;
  specialInstructions?: string;
  items: SalesOrderItemResponseDto[];
  shippingAddress: ShippingAddressDto;
  billingAddress: BillingAddressDto;
  createdBy: number;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: Date;
  remarks?: string;
}

export class SalesOrderItemResponseDto {
  id: number;
  salesOrderId: number;
  drugId: number;
  drugName: string;
  drugCode: string;
  batchPreference?: 'FEFO' | 'Specific';
  preferredBatchId?: number;
  preferredBatchNumber?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  allocatedQuantity: number;
  status: SalesOrderItemStatus;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

