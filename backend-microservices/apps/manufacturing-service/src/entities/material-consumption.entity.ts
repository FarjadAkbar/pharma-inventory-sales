import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { MaterialConsumptionStatus } from '@repo/shared';

@Entity('material_consumptions')
export class MaterialConsumption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  batchId: number;

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
  plannedQuantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  actualQuantity: number;

  @Column()
  unit: string;

  @Column({ type: 'varchar', default: MaterialConsumptionStatus.CONSUMED })
  status: MaterialConsumptionStatus;

  @Column({ nullable: true })
  locationId?: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  consumedAt: Date;

  @Column()
  consumedBy: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

