import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { DosageForm, Route, ApprovalStatus } from '@repo/shared';

@Entity('drugs')
export class Drug {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column()
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  formula?: string;

  @Column({ nullable: true })
  strength?: string;

  @Column({ type: 'varchar' })
  dosageForm: DosageForm;

  @Column({ type: 'varchar' })
  route: Route;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', default: ApprovalStatus.DRAFT })
  approvalStatus: ApprovalStatus;

  @Column({ nullable: true })
  therapeuticClass?: string;

  @Column({ nullable: true })
  manufacturer?: string;

  @Column({ nullable: true })
  registrationNumber?: string;

  @Column('timestamp', { nullable: true })
  expiryDate?: Date;

  @Column({ type: 'text', nullable: true })
  storageConditions?: string;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

