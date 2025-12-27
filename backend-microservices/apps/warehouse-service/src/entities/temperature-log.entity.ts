import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TemperatureLogType {
  WAREHOUSE = 'Warehouse',
  LOCATION = 'Location',
  INVENTORY_ITEM = 'Inventory Item',
  PUTAWAY = 'Putaway',
}

export enum TemperatureStatus {
  NORMAL = 'Normal',
  WARNING = 'Warning',
  CRITICAL = 'Critical',
  OUT_OF_RANGE = 'Out of Range',
}

@Entity('temperature_logs')
export class TemperatureLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', default: TemperatureLogType.WAREHOUSE })
  logType: TemperatureLogType;

  @Column({ nullable: true })
  @Index()
  warehouseId?: number;

  @Column({ nullable: true })
  locationId?: string;

  @Column({ nullable: true })
  @Index()
  inventoryItemId?: number;

  @Column({ nullable: true })
  @Index()
  putawayItemId?: number;

  @Column('decimal', { precision: 5, scale: 2 })
  temperature: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  humidity?: number;

  @Column({ type: 'varchar', default: TemperatureStatus.NORMAL })
  status: TemperatureStatus;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  minThreshold?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  maxThreshold?: number;

  @Column({ default: false })
  isOutOfRange: boolean;

  @Column({ nullable: true })
  sensorId?: string;

  @Column({ nullable: true })
  sensorName?: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  loggedAt: Date;

  @Column({ nullable: true })
  loggedBy?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

