import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'batches' })
export class BatchSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text', { unique: true })
  batchNumber!: string;

  @Column('uuid')
  drugId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  plannedQuantity!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  actualQuantity!: number;

  @Column('text', { default: 'Planned' })
  status!: string;

  @Column('timestamp', { nullable: true })
  startDate!: Date;

  @Column('timestamp', { nullable: true })
  endDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
