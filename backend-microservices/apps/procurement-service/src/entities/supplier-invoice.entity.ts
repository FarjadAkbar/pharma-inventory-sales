import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { SupplierInvoiceStatus } from '@repo/shared';

@Entity('supplier_invoices')
export class SupplierInvoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  invoiceNumber: string;

  @Column()
  @Index()
  supplierId: number;

  @Column({ nullable: true })
  @Index()
  purchaseOrderId: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column('timestamp')
  dueDate: Date;

  @Column({ type: 'varchar', default: SupplierInvoiceStatus.DRAFT })
  status: SupplierInvoiceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
