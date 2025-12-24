import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { QCSampleStatus, QCSamplePriority, QCSampleSourceType } from '@repo/shared';

@Entity('qc_samples')
export class QCSample {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  sampleNumber: string;

  @Column({ type: 'varchar' })
  sourceType: QCSampleSourceType;

  @Column()
  @Index()
  sourceId: number;

  @Column()
  sourceReference: string;

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

  @Column({ type: 'varchar', default: QCSamplePriority.NORMAL })
  priority: QCSamplePriority;

  @Column({ type: 'varchar', default: QCSampleStatus.PENDING })
  status: QCSampleStatus;

  @Column({ nullable: true })
  assignedTo?: number;

  @Column()
  requestedBy: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column('timestamp', { nullable: true })
  dueDate?: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

