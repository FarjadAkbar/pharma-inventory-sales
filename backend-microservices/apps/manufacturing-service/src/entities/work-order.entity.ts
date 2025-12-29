import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { WorkOrderStatus, ManufacturingPriority } from '@repo/shared';

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
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

  @Column()
  unit: string;

  @Column()
  bomVersion: number;

  @Column({ type: 'varchar', default: WorkOrderStatus.DRAFT })
  status: WorkOrderStatus;

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
  assignedTo?: number;

  @Column()
  createdBy: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

