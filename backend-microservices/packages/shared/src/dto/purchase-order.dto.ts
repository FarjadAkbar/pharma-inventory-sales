import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PurchaseOrderStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  RECEIVED = 'Received',
  CANCELLED = 'Cancelled',
}

export class CreatePurchaseOrderItemDto {
  @IsNumber()
  rawMaterialId: number;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @IsNumber()
  supplierId: number;

  @IsNumber()
  @IsOptional()
  siteId?: number;

  @IsDateString()
  expectedDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;
}

export class UpdatePurchaseOrderDto {
  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsNumber()
  @IsOptional()
  siteId?: number;

  @IsDateString()
  @IsOptional()
  expectedDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  @IsOptional()
  items?: CreatePurchaseOrderItemDto[];

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;
}

export class PurchaseOrderItemResponseDto {
  id: number;
  purchaseOrderId: number;
  rawMaterialId: number;
  rawMaterial?: { id: number; name: string; code: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PurchaseOrderResponseDto {
  id: number;
  poNumber: string;
  supplierId: number;
  supplier?: { id: number; name: string; contactPerson: string; email: string };
  siteId?: number;
  site?: { id: number; name: string; address?: string; city?: string };
  expectedDate: Date;
  status: PurchaseOrderStatus;
  totalAmount: number;
  items?: PurchaseOrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

