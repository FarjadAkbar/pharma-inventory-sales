import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Relation,
  UpdateDateColumn
} from 'typeorm';

import { SupplierSchema } from './supplier';

@Entity({ name: 'raw_materials' })
export class RawMaterialSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text', { unique: true })
  code!: string;

  @Column('text')
  name!: string;

  @Column('text')
  grade!: string;

  @Column('text')
  unitOfMeasure!: string;

  @Column('uuid')
  supplierId!: string;

  @ManyToOne(() => SupplierSchema)
  @JoinColumn({ name: 'supplierId' })
  supplier!: Relation<SupplierSchema>;

  @Column('text')
  storageRequirements!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
