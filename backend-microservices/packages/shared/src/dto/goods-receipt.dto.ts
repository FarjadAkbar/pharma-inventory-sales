import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, Min, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum GoodsReceiptStatus {
  DRAFT = 'Draft',
  VERIFIED = 'Verified',
  COMPLETED = 'Completed',
}

export class CreateGoodsReceiptItemDto {
  @IsNumber()
  purchaseOrderItemId: number;

  @IsNumber()
  @Min(0)
  receivedQuantity: number;

  @IsNumber()
  @Min(0)
  acceptedQuantity: number;

  @IsNumber()
  @Min(0)
  rejectedQuantity: number;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}

export class CreateGoodsReceiptDto {
  @IsNumber()
  purchaseOrderId: number;

  @IsDateString()
  receivedDate: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptItemDto)
  items: CreateGoodsReceiptItemDto[];

  @IsEnum(GoodsReceiptStatus)
  @IsOptional()
  status?: GoodsReceiptStatus;
}

export class UpdateGoodsReceiptDto {
  @IsDateString()
  @IsOptional()
  receivedDate?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptItemDto)
  @IsOptional()
  items?: CreateGoodsReceiptItemDto[];

  @IsEnum(GoodsReceiptStatus)
  @IsOptional()
  status?: GoodsReceiptStatus;
}

export class GoodsReceiptItemResponseDto {
  id: number;
  goodsReceiptId: number;
  purchaseOrderItemId: number;
  purchaseOrderItem?: { id: number; rawMaterialId: number; quantity: number; unitPrice: number };
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  batchNumber?: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class GoodsReceiptResponseDto {
  id: number;
  grnNumber: string;
  purchaseOrderId: number;
  purchaseOrder?: { id: number; poNumber: string; supplierId: number; siteId?: number };
  receivedDate: Date;
  status: GoodsReceiptStatus;
  remarks?: string;
  items?: GoodsReceiptItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

