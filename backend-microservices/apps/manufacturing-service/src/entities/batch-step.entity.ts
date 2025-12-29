import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { BatchStepStatus } from '@repo/shared';

@Entity('batch_steps')
export class BatchStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  batchId: number;

  @Column()
  stepNumber: number;

  @Column()
  stepName: string;

  @Column({ type: 'text' })
  instruction: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  parameters?: Record<string, any>;

  @Column({ type: 'varchar', default: BatchStepStatus.PENDING })
  status: BatchStepStatus;

  @Column({ nullable: true })
  performedBy?: number;

  @Column('timestamp', { nullable: true })
  performedAt?: Date;

  @Column({ type: 'text', nullable: true })
  eSignature?: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

