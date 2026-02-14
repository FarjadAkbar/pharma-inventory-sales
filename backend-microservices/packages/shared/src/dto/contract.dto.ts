import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsBoolean, Min } from 'class-validator';

// Contract Types
export enum ContractType {
  SALES = 'sales',
  SERVICE = 'service',
  MAINTENANCE = 'maintenance',
  SUPPLY = 'supply',
  DISTRIBUTION = 'distribution',
}

// Contract Status
export enum ContractStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

// Create Contract DTO
export class CreateContractDto {
  @IsString()
  title: string;

  @IsNumber()
  accountId: number;

  @IsString()
  accountName: string;

  @IsEnum(ContractType)
  type: ContractType;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsString()
  currency: string;

  @IsString()
  paymentTerms: string;

  @IsNumber()
  contractManager: number;

  @IsOptional()
  @IsNumber()
  signedBy?: number;

  @IsOptional()
  @IsDateString()
  signedDate?: string;

  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @IsString()
  terms: string;

  @IsOptional()
  @IsString()
  specialConditions?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsNumber()
  createdBy: number;
}

// Update Contract DTO
export class UpdateContractDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  accountId?: number;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  contractManager?: number;

  @IsOptional()
  @IsNumber()
  signedBy?: number;

  @IsOptional()
  @IsDateString()
  signedDate?: string;

  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  specialConditions?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}

// Contract Response DTO
export class ContractResponseDto {
  id: number;
  contractNumber: string;
  title: string;
  accountId: number;
  accountName: string;
  type: ContractType;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  value: number;
  currency: string;
  paymentTerms: string;
  contractManager: number;
  contractManagerName?: string;
  signedBy?: number;
  signedByName?: string;
  signedDate?: Date;
  autoRenewal: boolean;
  terms: string;
  specialConditions?: string;
  documentUrl?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}
