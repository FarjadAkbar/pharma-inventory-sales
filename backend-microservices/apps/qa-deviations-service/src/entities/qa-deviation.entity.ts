import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { DeviationSeverity, DeviationCategory, DeviationStatus, DeviationSourceType } from '@repo/shared';

@Entity('qa_deviations')
export class QADeviation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  deviationNumber: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  severity: DeviationSeverity;

  @Column({ type: 'varchar' })
  category: DeviationCategory;

  @Column({ type: 'varchar', default: DeviationStatus.OPEN })
  status: DeviationStatus;

  @Column({ type: 'varchar' })
  sourceType: DeviationSourceType;

  @Column()
  @Index()
  sourceId: number;

  @Column()
  sourceReference: string;

  @Column({ nullable: true })
  @Index()
  materialId?: number;

  @Column({ nullable: true })
  materialName?: string;

  @Column({ nullable: true })
  batchNumber?: string;

  @Column()
  discoveredBy: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  discoveredAt: Date;

  @Column({ nullable: true })
  assignedTo?: number;

  @Column('timestamp', { nullable: true })
  assignedAt?: Date;

  @Column('timestamp', { nullable: true })
  dueDate?: Date;

  @Column('timestamp', { nullable: true })
  closedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rootCause?: string;

  @Column({ type: 'text', nullable: true })
  immediateAction?: string;

  @Column({ type: 'text', nullable: true })
  correctiveAction?: string;

  @Column({ type: 'text', nullable: true })
  preventiveAction?: string;

  @Column({ type: 'text', nullable: true })
  effectivenessCheck?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

