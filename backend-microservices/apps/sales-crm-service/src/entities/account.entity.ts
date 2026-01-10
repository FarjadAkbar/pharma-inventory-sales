import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { AccountType, AccountStatus } from '@repo/shared';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  accountNumber: string;

  @Column()
  @Index()
  accountName: string;

  @Column()
  @Index()
  accountCode: string;

  @Column({ type: 'varchar' })
  type: AccountType;

  @Column({ type: 'varchar', default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  creditLimit?: number;

  @Column({ type: 'text', nullable: true })
  paymentTerms?: string;

  @Column({ nullable: true })
  assignedSalesRep?: number;

  @Column({ nullable: true })
  assignedSalesRepName?: string;

  @Column({ nullable: true })
  taxId?: string;

  @Column({ nullable: true })
  registrationNumber?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
