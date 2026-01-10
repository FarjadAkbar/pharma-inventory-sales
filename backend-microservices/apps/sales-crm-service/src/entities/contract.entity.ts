import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ContractType, ContractStatus } from '@repo/shared';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  contractNumber: string;

  @Column()
  title: string;

  @Column()
  @Index()
  accountId: number;

  @Column()
  accountName: string;

  @Column({ type: 'varchar' })
  type: ContractType;

  @Column({ type: 'varchar', default: ContractStatus.DRAFT })
  status: ContractStatus;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp')
  endDate: Date;

  @Column('timestamp', { nullable: true })
  renewalDate?: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column()
  currency: string;

  @Column({ type: 'text' })
  paymentTerms: string;

  @Column()
  contractManager: number;

  @Column({ nullable: true })
  contractManagerName?: string;

  @Column({ nullable: true })
  signedBy?: number;

  @Column({ nullable: true })
  signedByName?: string;

  @Column('timestamp', { nullable: true })
  signedDate?: Date;

  @Column({ default: false })
  autoRenewal: boolean;

  @Column({ type: 'text' })
  terms: string;

  @Column({ type: 'text', nullable: true })
  specialConditions?: string;

  @Column({ nullable: true })
  documentUrl?: string;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
