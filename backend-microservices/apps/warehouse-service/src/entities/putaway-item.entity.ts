import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PutawayStatus } from '@repo/shared';

@Entity('putaway_items')
export class PutawayItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  putawayNumber: string;

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

  @Column({ type: 'varchar', default: PutawayStatus.PENDING })
  status: PutawayStatus;

  @Column({ nullable: true })
  locationId?: string;

  @Column({ nullable: true })
  zone?: string;

  @Column({ nullable: true })
  rack?: string;

  @Column({ nullable: true })
  shelf?: string;

  @Column({ nullable: true })
  position?: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  temperature?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  humidity?: number;

  @Column({ nullable: true })
  goodsReceiptItemId?: number;

  @Column({ nullable: true })
  @Index()
  qaReleaseId?: number;

  @Column()
  requestedBy: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ nullable: true })
  assignedBy?: number;

  @Column('timestamp', { nullable: true })
  assignedAt?: Date;

  @Column({ nullable: true })
  completedBy?: number;

  @Column('timestamp', { nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

