import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PaymentMethod, PaymentStatus, TransactionStatus } from '@repo/shared';

@Entity('pos_transactions')
export class POSTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  transactionNumber: string;

  @Column()
  terminalId: string;

  @Column()
  terminalName: string;

  @Column()
  @Index()
  siteId: number;

  @Column()
  siteName: string;

  @Column()
  cashierId: number;

  @Column()
  cashierName: string;

  @Column({ nullable: true })
  @Index()
  customerId?: number;

  @Column({ nullable: true })
  customerName?: string;

  @Column({ type: 'jsonb' })
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', default: TransactionStatus.DRAFT })
  status: TransactionStatus;

  @Column('timestamp')
  transactionDate: Date;

  @Column({ nullable: true })
  receiptNumber?: string;

  @Column({ nullable: true })
  receiptUrl?: string;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
