import { BaseEntity, Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'qc_samples' })
export class QCSampleSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text', { unique: true })
  sampleNumber!: string;

  @Column('text')
  sourceType!: string;

  @Column('uuid')
  sourceId!: string;

  @Column('uuid')
  materialId!: string;

  @Column('text', { default: 'Pending' })
  status!: string;

  @Column('text', { default: 'Medium' })
  priority!: string;

  @Column('uuid', { nullable: true })
  assignedTo!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
