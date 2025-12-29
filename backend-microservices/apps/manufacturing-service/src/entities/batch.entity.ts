import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { BatchStatus, ManufacturingPriority } from '@repo/shared';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  batchNumber: string;

  @Column()
  @Index()
  workOrderId: number;

  @Column()
  workOrderNumber: string;

  @Column()
  @Index()
  drugId: number;

  @Column()
  drugName: string;

  @Column()
  drugCode: string;

  @Column()
  @Index()
  siteId: number;

  @Column()
  siteName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  plannedQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  actualQuantity?: number;

  @Column()
  unit: string;

  @Column()
  bomVersion: number;

  @Column({ type: 'varchar', default: BatchStatus.DRAFT })
  status: BatchStatus;

  @Column({ type: 'varchar', default: ManufacturingPriority.NORMAL })
  priority: ManufacturingPriority;

  @Column('timestamp')
  plannedStartDate: Date;

  @Column('timestamp')
  plannedEndDate: Date;

  @Column('timestamp', { nullable: true })
  actualStartDate?: Date;

  @Column('timestamp', { nullable: true })
  actualEndDate?: Date;

  @Column({ nullable: true })
  startedBy?: number;

  @Column('timestamp', { nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  completedBy?: number;

  @Column('timestamp', { nullable: true })
  completedAt?: Date;

  @Column({ default: false })
  hasFault: boolean;

  @Column({ type: 'text', nullable: true })
  faultDescription?: string;

  @Column({ nullable: true })
  qcSampleId?: number;

  @Column({ nullable: true })
  putawayId?: number;

  @Column()
  createdBy: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

