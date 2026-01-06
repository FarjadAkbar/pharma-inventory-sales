import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SalesOrderItemStatus } from '@repo/shared';
import { SalesOrder } from './sales-order.entity';

@Entity('sales_order_items')
export class SalesOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  salesOrderId: number;

  @ManyToOne(() => SalesOrder, salesOrder => salesOrder.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder: SalesOrder;

  @Column()
  @Index()
  drugId: number;

  @Column()
  drugName: string;

  @Column()
  drugCode: string;

  @Column({ type: 'varchar', nullable: true })
  batchPreference?: 'FEFO' | 'Specific';

  @Column({ nullable: true })
  preferredBatchId?: number;

  @Column({ nullable: true })
  preferredBatchNumber?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  allocatedQuantity: number;

  @Column({ type: 'varchar', default: SalesOrderItemStatus.PENDING })
  status: SalesOrderItemStatus;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

