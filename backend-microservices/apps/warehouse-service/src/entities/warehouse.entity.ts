import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { StorageLocation } from './storage-location.entity';

export enum WarehouseType {
  MAIN = 'Main',
  DISTRIBUTION = 'Distribution',
  COLD_STORAGE = 'Cold Storage',
  QUARANTINE = 'Quarantine',
  HOLD = 'Hold',
}

export enum WarehouseStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  MAINTENANCE = 'Maintenance',
}

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'varchar', default: WarehouseType.MAIN })
  type: WarehouseType;

  @Column({ type: 'varchar', default: WarehouseStatus.ACTIVE })
  status: WarehouseStatus;

  @Column({ nullable: true })
  siteId?: number;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  minTemperature?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  maxTemperature?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  minHumidity?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  maxHumidity?: number;

  @Column({ nullable: true })
  managerId?: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => StorageLocation, (location) => location.warehouse)
  locations?: StorageLocation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

