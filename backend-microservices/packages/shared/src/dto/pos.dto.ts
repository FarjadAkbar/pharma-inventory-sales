import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsDateString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Payment Methods
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
  CHECK = 'check',
  OTHER = 'other',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Transaction Status
export enum TransactionStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  VOIDED = 'voided',
}

// POS Item DTO
export class POSItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;
}

// Create POS Transaction DTO
export class CreatePOSTransactionDto {
  @IsString()
  terminalId: string;

  @IsString()
  terminalName: string;

  @IsNumber()
  siteId: number;

  @IsString()
  siteName: string;

  @IsNumber()
  cashierId: number;

  @IsString()
  cashierName: string;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POSItemDto)
  items: POSItemDto[];

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  tax: number;

  @IsNumber()
  @Min(0)
  discount: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsNumber()
  createdBy: number;
}

// Update POS Transaction DTO
export class UpdatePOSTransactionDto {
  @IsOptional()
  @IsString()
  terminalId?: string;

  @IsOptional()
  @IsString()
  terminalName?: string;

  @IsOptional()
  @IsNumber()
  siteId?: number;

  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsNumber()
  cashierId?: number;

  @IsOptional()
  @IsString()
  cashierName?: string;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POSItemDto)
  items?: POSItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

// POS Transaction Response DTO
export class POSTransactionResponseDto {
  id: number;
  transactionNumber: string;
  terminalId: string;
  terminalName: string;
  siteId: number;
  siteName: string;
  cashierId: number;
  cashierName: string;
  customerId?: number;
  customerName?: string;
  items: POSItemDto[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: TransactionStatus;
  transactionDate: Date;
  receiptNumber?: string;
  receiptUrl?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}
