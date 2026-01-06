import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { SalesOrderStatus, DistributionPriority } from '@repo/shared';
import { SalesOrderItem } from './sales-order-item.entity';

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  orderNumber: string;

  @Column()
  @Index()
  accountId: number;

  @Column()
  accountName: string;

  @Column()
  accountCode: string;

  @Column()
  @Index()
  siteId: number;

  @Column()
  siteName: string;

  @Column('timestamp')
  requestedShipDate: Date;

  @Column('timestamp', { nullable: true })
  actualShipDate?: Date;

  @Column('timestamp', { nullable: true })
  deliveryDate?: Date;

  @Column({ type: 'varchar', default: SalesOrderStatus.DRAFT })
  status: SalesOrderStatus;

  @Column({ type: 'varchar', default: DistributionPriority.NORMAL })
  priority: DistributionPriority;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column()
  currency: string;

  @Column({ type: 'text', nullable: true })
  specialInstructions?: string;

  @Column({ type: 'jsonb' })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactPerson: string;
    phone: string;
    email: string;
    deliveryInstructions?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column({ type: 'jsonb' })
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactPerson: string;
    phone: string;
    email: string;
    taxId: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  approvedBy?: number;

  @Column('timestamp', { nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => SalesOrderItem, item => item.salesOrder, { cascade: true })
  items: SalesOrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

