import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { StockMovementType } from '@repo/shared';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  movementNumber: string;

  @Column({ type: 'varchar' })
  movementType: StockMovementType;

  @Column()
  @Index()
  materialId: number;

  @Column({ nullable: true })
  materialName?: string;

  @Column({ nullable: true })
  materialCode?: string;

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
  @Index()
  referenceId?: string;

  @Column({ nullable: true })
  referenceType?: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column()
  performedBy: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  performedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

