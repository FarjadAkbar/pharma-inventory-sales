import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'drugs' })
export class DrugSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text', { unique: true })
  code!: string;

  @Column('text')
  name!: string;

  @Column('text')
  formula!: string;

  @Column('text')
  strength!: string;

  @Column('text')
  dosageForm!: string;

  @Column('text')
  route!: string;

  @Column('text')
  description!: string;

  @Column('text', { default: 'Draft' })
  approvalStatus!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
