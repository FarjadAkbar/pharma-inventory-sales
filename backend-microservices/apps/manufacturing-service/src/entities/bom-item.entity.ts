import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BOM } from './bom.entity';

@Entity('bom_items')
export class BOMItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  bomId: number;

  @ManyToOne(() => BOM, bom => bom.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bomId' })
  bom: BOM;

  @Column()
  @Index()
  materialId: number;

  @Column()
  materialName: string;

  @Column()
  materialCode: string;

  @Column('decimal', { precision: 10, scale: 4 })
  quantityPerBatch: number;

  @Column()
  unitOfMeasure: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  tolerance?: number;

  @Column({ default: false })
  isCritical: boolean;

  @Column()
  sequence: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

