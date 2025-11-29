import { BaseEntity, Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'deviations' })
export class DeviationSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text', { unique: true })
  deviationNumber!: string;

  @Column('text')
  title!: string;

  @Column('text')
  description!: string;

  @Column('text')
  severity!: string;

  @Column('text', { default: 'Open' })
  status!: string;

  @Column('text', { nullable: true })
  rootCause!: string;

  @Column('text')
  correctiveActions!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
