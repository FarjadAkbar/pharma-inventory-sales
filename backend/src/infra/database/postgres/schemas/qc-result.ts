import { BaseEntity, Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'qc_results' })
export class QCResultSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('uuid')
  sampleId!: string;

  @Column('uuid')
  testId!: string;

  @Column('text')
  resultValue!: string;

  @Column('boolean')
  passed!: boolean;

  @Column('uuid')
  testedBy!: string;

  @Column('timestamp')
  testedAt!: Date;

  @Column('text', { nullable: true })
  remarks!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
