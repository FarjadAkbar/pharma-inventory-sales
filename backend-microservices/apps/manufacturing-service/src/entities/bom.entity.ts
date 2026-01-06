import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { BOMStatus } from '@repo/shared';
import { BOMItem } from './bom-item.entity';

@Entity('boms')
export class BOM {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  bomNumber: string;

  @Column()
  @Index()
  drugId: number;

  @Column()
  drugName: string;

  @Column()
  drugCode: string;

  @Column()
  @Index()
  version: number;

  @Column({ type: 'varchar', default: BOMStatus.DRAFT })
  status: BOMStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  batchSize: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  yield?: number;

  @Column('timestamp', { nullable: true })
  effectiveDate?: Date;

  @Column('timestamp', { nullable: true })
  expiryDate?: Date;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  approvedBy?: number;

  @Column('timestamp', { nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => BOMItem, bomItem => bomItem.bom, { cascade: true })
  items: BOMItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

