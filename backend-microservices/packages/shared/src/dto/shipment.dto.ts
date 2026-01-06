import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, Min, ValidateNested, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { DistributionPriority, ShippingAddressDto } from './sales-order.dto';

// Shipment Status
export enum ShipmentStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  ALLOCATED = 'Allocated',
  PICKED = 'Picked',
  PACKED = 'Packed',
  SHIPPED = 'Shipped',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  RETURNED = 'Returned',
  CANCELLED = 'Cancelled',
}

// Shipment Item Status
export enum ShipmentItemStatus {
  PENDING = 'Pending',
  ALLOCATED = 'Allocated',
  PICKED = 'Picked',
  PACKED = 'Packed',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
}

// Packaging Instruction DTO
export class PackagingInstructionDto {
  @IsNumber()
  drugId: number;

  @IsString()
  drugName: string;

  @IsString()
  packagingType: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsArray()
  @IsString({ each: true })
  specialRequirements: string[];

  @IsObject()
  temperatureRange: {
    min: number;
    max: number;
    unit: string;
  };

  @IsString()
  handlingInstructions: string;
}

// Special Handling DTO
export class SpecialHandlingDto {
  @IsEnum(['Fragile', 'Hazardous', 'Temperature Sensitive', 'Light Sensitive', 'Other'])
  type: 'Fragile' | 'Hazardous' | 'Temperature Sensitive' | 'Light Sensitive' | 'Other';

  @IsString()
  description: string;

  @IsString()
  instructions: string;

  @IsBoolean()
  required: boolean;
}

// Temperature Requirement DTO
export class TemperatureRequirementDto {
  @IsNumber()
  minTemperature: number;

  @IsNumber()
  maxTemperature: number;

  @IsString()
  unit: string;

  @IsBoolean()
  monitoringRequired: boolean;

  @IsNumber()
  alertThreshold: number;
}

// Shipment Item DTO
export class ShipmentItemDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsNumber()
  drugId: number;

  @IsString()
  drugName: string;

  @IsString()
  drugCode: string;

  @IsString()
  batchNumber: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pickedQuantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  packedQuantity?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

// Create Shipment DTO
export class CreateShipmentDto {
  @IsNumber()
  salesOrderId: number;

  @IsString()
  salesOrderNumber: string;

  @IsNumber()
  accountId: number;

  @IsString()
  accountName: string;

  @IsNumber()
  siteId: number;

  @IsString()
  siteName: string;

  @IsDateString()
  shipmentDate: string;

  @IsDateString()
  expectedDeliveryDate: string;

  @IsEnum(DistributionPriority)
  @IsOptional()
  priority?: DistributionPriority;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  carrier: string;

  @IsString()
  serviceType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentItemDto)
  items: ShipmentItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackagingInstructionDto)
  @IsOptional()
  packagingInstructions?: PackagingInstructionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialHandlingDto)
  @IsOptional()
  specialHandling?: SpecialHandlingDto[];

  @ValidateNested()
  @Type(() => TemperatureRequirementDto)
  @IsOptional()
  temperatureRequirements?: TemperatureRequirementDto;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsNumber()
  createdBy: number;
}

// Update Shipment DTO
export class UpdateShipmentDto {
  @IsDateString()
  @IsOptional()
  shipmentDate?: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsDateString()
  @IsOptional()
  actualDeliveryDate?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  carrier?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}

// Allocate Stock DTO
export class AllocateStockDto {
  @IsNumber()
  shipmentId: number;

  @IsNumber()
  shipmentItemId: number;

  @IsNumber()
  inventoryId: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  allocatedBy: number;
}

// Pick Item DTO
export class PickItemDto {
  @IsNumber()
  shipmentItemId: number;

  @IsNumber()
  @Min(0)
  pickedQuantity: number;

  @IsNumber()
  pickedBy: number;
}

// Pack Item DTO
export class PackItemDto {
  @IsNumber()
  shipmentItemId: number;

  @IsNumber()
  @Min(0)
  packedQuantity: number;

  @IsNumber()
  packedBy: number;
}

// Ship Order DTO
export class ShipOrderDto {
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  carrier: string;

  @IsString()
  serviceType: string;

  @IsDateString()
  @IsOptional()
  shipmentDate?: string;

  @IsNumber()
  shippedBy: number;
}

// Shipment Response DTO
export class ShipmentResponseDto {
  id: number;
  shipmentNumber: string;
  salesOrderId: number;
  salesOrderNumber: string;
  accountId: number;
  accountName: string;
  siteId: number;
  siteName: string;
  status: ShipmentStatus;
  priority: DistributionPriority;
  shipmentDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  carrier: string;
  serviceType: string;
  items: ShipmentItemResponseDto[];
  shippingAddress: ShippingAddressDto;
  packagingInstructions?: PackagingInstructionDto[];
  specialHandling?: SpecialHandlingDto[];
  temperatureRequirements?: TemperatureRequirementDto;
  createdBy: number;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  remarks?: string;
}

// Shipment Item Response DTO
export class ShipmentItemResponseDto {
  id: number;
  shipmentId: number;
  drugId: number;
  drugName: string;
  drugCode: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  location?: string;
  pickedQuantity: number;
  packedQuantity: number;
  status: ShipmentItemStatus;
  pickedBy?: number;
  pickedByName?: string;
  pickedAt?: Date;
  packedBy?: number;
  packedByName?: string;
  packedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

