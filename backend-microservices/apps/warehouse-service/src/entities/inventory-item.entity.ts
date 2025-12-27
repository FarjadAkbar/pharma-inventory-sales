import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { InventoryStatus } from '@repo/shared';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  itemCode: string;

  @Column()
  @Index()
  materialId: number;

  @Column()
  materialName: string;

  @Column()
  materialCode: string;

  @Column()
  @Index()
  batchNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

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

  @Column({ type: 'varchar', default: InventoryStatus.AVAILABLE })
  status: InventoryStatus;

  @Column('timestamp', { nullable: true })
  expiryDate?: Date;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  temperature?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  humidity?: number;

  @Column({ nullable: true })
  goodsReceiptItemId?: number;

  @Column({ nullable: true })
  @Index()
  qaReleaseId?: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column('timestamp', { nullable: true })
  lastUpdated?: Date;

  @Column({ nullable: true })
  lastUpdatedBy?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

