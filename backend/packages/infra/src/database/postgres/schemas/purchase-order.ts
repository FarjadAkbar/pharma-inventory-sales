import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
  UpdateDateColumn
} from 'typeorm';

import { SupplierSchema } from './supplier';

@Entity({ name: 'purchase_orders' })
export class PurchaseOrderSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text', { unique: true })
  poNumber!: string;

  @Column('uuid')
  supplierId!: string;

  @ManyToOne(() => SupplierSchema)
  @JoinColumn({ name: 'supplierId' })
  supplier!: Relation<SupplierSchema>;

  @Column('uuid', { nullable: true })
  siteId!: string;

  @Column('timestamp')
  expectedDate!: Date;

  @Column('text', { default: 'Draft' })
  status!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount!: number;

  @OneToMany(() => PurchaseOrderItemSchema, (item) => item.purchaseOrder)
  items!: Relation<PurchaseOrderItemSchema[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

@Entity({ name: 'purchase_order_items' })
export class PurchaseOrderItemSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('uuid')
  purchaseOrderId!: string;

  @ManyToOne(() => PurchaseOrderSchema, (po) => po.items)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder!: Relation<PurchaseOrderSchema>;

  @Column('uuid')
  materialId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
