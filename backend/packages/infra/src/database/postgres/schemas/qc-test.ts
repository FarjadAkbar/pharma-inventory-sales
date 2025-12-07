import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'qc_tests' })
export class QCTestSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  description!: string;

  @Column('text')
  materialType!: string;

  @Column('text')
  specifications!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
