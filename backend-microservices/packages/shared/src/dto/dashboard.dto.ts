import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DashboardStatDto {
  @IsString()
  title: string;

  @IsString()
  value: string;

  @IsString()
  description: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export class DashboardStatsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardStatDto)
  stats: DashboardStatDto[];
}

export enum StockAlertType {
  LOW_STOCK = 'Low Stock',
  EXPIRING = 'Expiring',
  EXPIRED = 'Expired',
  OUT_OF_STOCK = 'Out of Stock',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class StockAlertDto {
  @IsString()
  name: string;

  @IsEnum(StockAlertType)
  type: StockAlertType;

  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsNumber()
  itemId?: number;

  @IsOptional()
  @IsString()
  itemCode?: string;
}

export class StockAlertsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockAlertDto)
  alerts: StockAlertDto[];
}

export class NotificationDto {
  @IsString()
  type: string;

  @IsString()
  message: string;

  @IsString()
  time: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;
}

export class NotificationsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationDto)
  notifications: NotificationDto[];
}

export class ActivityDto {
  @IsString()
  action: string;

  @IsString()
  user: string;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  details?: string;
}

export class ActivitiesResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  activities: ActivityDto[];
}
