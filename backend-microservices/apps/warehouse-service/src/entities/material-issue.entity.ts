import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { MaterialIssueStatus } from '@repo/shared';

@Entity('material_issues')
export class MaterialIssue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  issueNumber: string;

  @Column()
  @Index()
  materialId: number;

  @Column()
  materialName: string;

  @Column()
  materialCode: string;

  @Column({ nullable: true })
  batchNumber?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  @Column({ nullable: true })
  fromLocationId?: string;

  @Column({ nullable: true })
  toLocationId?: string;

  @Column({ nullable: true })
  workOrderId?: string;

  @Column({ nullable: true })
  batchId?: string;

  @Column({ nullable: true })
  @Index()
  referenceId?: string;

  @Column({ nullable: true })
  referenceType?: string;

  @Column({ type: 'varchar', default: MaterialIssueStatus.PENDING })
  status: MaterialIssueStatus;

  @Column()
  requestedBy: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ nullable: true })
  approvedBy?: number;

  @Column('timestamp', { nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  pickedBy?: number;

  @Column('timestamp', { nullable: true })
  pickedAt?: Date;

  @Column({ nullable: true })
  issuedBy?: number;

  @Column('timestamp', { nullable: true })
  issuedAt?: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

