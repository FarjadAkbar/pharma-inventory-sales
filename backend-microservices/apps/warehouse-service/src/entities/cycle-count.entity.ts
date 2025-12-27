import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CycleCountStatus {
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum CycleCountType {
  FULL = 'Full',
  PARTIAL = 'Partial',
  RANDOM = 'Random',
  ABC = 'ABC',
  LOCATION_BASED = 'Location Based',
}

@Entity('cycle_counts')
export class CycleCount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  countNumber: string;

  @Column({ type: 'varchar', default: CycleCountType.FULL })
  countType: CycleCountType;

  @Column({ type: 'varchar', default: CycleCountStatus.PLANNED })
  status: CycleCountStatus;

  @Column({ nullable: true })
  @Index()
  warehouseId?: number;

  @Column({ nullable: true })
  locationId?: string;

  @Column({ nullable: true })
  zone?: string;

  @Column({ nullable: true })
  materialId?: number;

  @Column({ nullable: true })
  batchNumber?: string;

  @Column('timestamp', { nullable: true })
  scheduledDate?: Date;

  @Column('timestamp', { nullable: true })
  startedAt?: Date;

  @Column('timestamp', { nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  assignedTo?: number;

  @Column({ nullable: true })
  performedBy?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  expectedQuantity?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  countedQuantity?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  variance?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  variancePercentage?: number;

  @Column({ default: false })
  hasVariance: boolean;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({ type: 'text', nullable: true })
  adjustmentReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

