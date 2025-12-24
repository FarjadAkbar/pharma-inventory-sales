import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { QCResultStatus } from '@repo/shared';

@Entity('qc_results')
export class QCResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  sampleId: number;

  @Column()
  @Index()
  testId: number;

  @Column()
  resultValue: string;

  @Column()
  unit: string;

  @Column()
  passed: boolean;

  @Column({ type: 'varchar', default: QCResultStatus.PENDING })
  status: QCResultStatus;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column()
  performedBy: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  performedAt: Date;

  @Column({ default: false })
  submittedToQA: boolean;

  @Column('timestamp', { nullable: true })
  submittedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

