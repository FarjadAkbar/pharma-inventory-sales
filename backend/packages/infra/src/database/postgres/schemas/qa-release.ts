import { BaseEntity, Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'qa_releases' })
export class QAReleaseSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text')
  entityType!: string;

  @Column('uuid')
  entityId!: string;

  @Column('text')
  decision!: string;

  @Column('uuid', { nullable: true })
  qcSampleId!: string;

  @Column('text')
  remarks!: string;

  @Column('uuid')
  releasedBy!: string;

  @Column('timestamp')
  releasedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
