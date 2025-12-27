import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { QAReleaseStatus, QADecision } from '@repo/shared';
import { QAChecklistItem } from './qa-checklist-item.entity';

@Entity('qa_releases')
export class QARelease {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  releaseNumber: string;

  @Column()
  @Index()
  sampleId: number;

  @Column()
  @Index()
  goodsReceiptItemId: number;

  @Column()
  @Index()
  materialId: number;

  @Column()
  materialName: string;

  @Column()
  materialCode: string;

  @Column()
  batchNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'varchar', default: QAReleaseStatus.PENDING })
  status: QAReleaseStatus;

  @Column({ type: 'varchar', nullable: true })
  decision?: QADecision;

  @Column({ type: 'text', nullable: true })
  decisionReason?: string;

  @OneToMany(() => QAChecklistItem, (item) => item.release, { cascade: true })
  checklistItems: QAChecklistItem[];

  @Column('simple-array', { nullable: true })
  qcResultIds: number[];

  @Column()
  submittedBy: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedBy?: number;

  @Column('timestamp', { nullable: true })
  reviewedAt?: Date;

  @Column({ nullable: true })
  decidedBy?: number;

  @Column('timestamp', { nullable: true })
  decidedAt?: Date;

  @Column({ type: 'text', nullable: true })
  eSignature?: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({ default: false })
  warehouseNotified: boolean;

  @Column('timestamp', { nullable: true })
  warehouseNotifiedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

