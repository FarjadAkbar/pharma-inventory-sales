import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'suppliers' })
export class SupplierSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  contactPerson!: string;

  @Column('text')
  email!: string;

  @Column('text')
  phone!: string;

  @Column('text')
  address!: string;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating!: number;

  @Column('text', { default: 'Active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
