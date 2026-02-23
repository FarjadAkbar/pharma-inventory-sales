import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, Min } from 'class-validator';

export enum SupplierInvoiceStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  PAID = 'Paid',
  CANCELLED = 'Cancelled',
}

export class CreateSupplierInvoiceDto {
  @IsString()
  invoiceNumber: string;

  @IsNumber()
  supplierId: number;

  @IsNumber()
  @IsOptional()
  purchaseOrderId?: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  dueDate: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(SupplierInvoiceStatus)
  @IsOptional()
  status?: SupplierInvoiceStatus;
}

export class UpdateSupplierInvoiceDto {
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsNumber()
  @IsOptional()
  purchaseOrderId?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(SupplierInvoiceStatus)
  @IsOptional()
  status?: SupplierInvoiceStatus;
}

export interface SupplierInvoiceResponseDto {
  id: number;
  invoiceNumber: string;
  supplierId: number;
  purchaseOrderId?: number;
  amount: number;
  currency: string;
  dueDate: Date;
  status: SupplierInvoiceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
