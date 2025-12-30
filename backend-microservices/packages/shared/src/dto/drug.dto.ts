import { IsString, IsOptional, IsNumber, IsEnum, MinLength, MaxLength, IsArray, IsDateString } from 'class-validator';

export enum DosageForm {
  TABLET = 'Tablet',
  CAPSULE = 'Capsule',
  SYRUP = 'Syrup',
  INJECTION = 'Injection',
  OINTMENT = 'Ointment',
  CREAM = 'Cream',
  DROPS = 'Drops',
  POWDER = 'Powder',
  SUSPENSION = 'Suspension',
  PATCH = 'Patch',
  INHALER = 'Inhaler',
}

export enum Route {
  ORAL = 'Oral',
  IV = 'IV',
  IM = 'IM',
  SC = 'SC',
  TOPICAL = 'Topical',
  INHALATION = 'Inhalation',
  RECTAL = 'Rectal',
  VAGINAL = 'Vaginal',
  OPTHALMIC = 'Ophthalmic',
  OTIC = 'Otic',
  NASAL = 'Nasal',
}

export enum ApprovalStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  UNDER_REVIEW = 'Under Review',
}

export class CreateDrugDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  formula?: string;

  @IsString()
  @IsOptional()
  strength?: string;

  @IsEnum(DosageForm)
  dosageForm: DosageForm;

  @IsEnum(Route)
  route: Route;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ApprovalStatus)
  @IsOptional()
  approvalStatus?: ApprovalStatus;

  @IsString()
  @IsOptional()
  therapeuticClass?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  storageConditions?: string;

  @IsNumber()
  createdBy: number;
}

export class UpdateDrugDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  formula?: string;

  @IsString()
  @IsOptional()
  strength?: string;

  @IsEnum(DosageForm)
  @IsOptional()
  dosageForm?: DosageForm;

  @IsEnum(Route)
  @IsOptional()
  route?: Route;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ApprovalStatus)
  @IsOptional()
  approvalStatus?: ApprovalStatus;

  @IsString()
  @IsOptional()
  therapeuticClass?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  storageConditions?: string;
}

export class DrugResponseDto {
  id: number;
  code: string;
  name: string;
  formula?: string;
  strength?: string;
  dosageForm: DosageForm;
  route: Route;
  description?: string;
  approvalStatus: ApprovalStatus;
  therapeuticClass?: string;
  manufacturer?: string;
  registrationNumber?: string;
  expiryDate?: Date;
  storageConditions?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

