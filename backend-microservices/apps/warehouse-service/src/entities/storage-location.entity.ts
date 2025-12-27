import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';

export enum LocationType {
  BIN = 'Bin',
  RACK = 'Rack',
  SHELF = 'Shelf',
  PALLET = 'Pallet',
  BULK = 'Bulk',
  COLD_ROOM = 'Cold Room',
  FREEZER = 'Freezer',
}

export enum LocationStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  RESERVED = 'Reserved',
  BLOCKED = 'Blocked',
  MAINTENANCE = 'Maintenance',
}

@Entity('storage_locations')
export class StorageLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  locationCode: string;

  @Column()
  @Index()
  warehouseId: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.locations)
  @JoinColumn({ name: 'warehouseId' })
  warehouse?: Warehouse;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: LocationType.BIN })
  type: LocationType;

  @Column({ type: 'varchar', default: LocationStatus.AVAILABLE })
  status: LocationStatus;

  @Column({ nullable: true })
  zone?: string;

  @Column({ nullable: true })
  aisle?: string;

  @Column({ nullable: true })
  rack?: string;

  @Column({ nullable: true })
  shelf?: string;

  @Column({ nullable: true })
  position?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  capacity?: number;

  @Column({ nullable: true })
  capacityUnit?: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  minTemperature?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  maxTemperature?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  minHumidity?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  maxHumidity?: number;

  @Column({ default: false })
  requiresTemperatureControl: boolean;

  @Column({ default: false })
  requiresHumidityControl: boolean;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

