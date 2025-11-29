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

import { PurchaseOrderSchema, PurchaseOrderItemSchema } from './purchase-order';

@Entity({ name: 'goods_receipts' })
export class GoodsReceiptSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text', { unique: true })
  grnNumber!: string;

  @Column('uuid')
  purchaseOrderId!: string;

  @ManyToOne(() => PurchaseOrderSchema)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder!: Relation<PurchaseOrderSchema>;

  @Column('timestamp')
  receivedDate!: Date;

  @Column('text', { default: 'Draft' })
  status!: string;

  @Column('text', { nullable: true })
  remarks!: string;

  @OneToMany(() => GoodsReceiptItemSchema, (item) => item.goodsReceipt)
  items!: Relation<GoodsReceiptItemSchema[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

@Entity({ name: 'goods_receipt_items' })
export class GoodsReceiptItemSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('uuid')
  goodsReceiptId!: string;

  @ManyToOne(() => GoodsReceiptSchema, (grn) => grn.items)
  @JoinColumn({ name: 'goodsReceiptId' })
  goodsReceipt!: Relation<GoodsReceiptSchema>;

  @Column('uuid')
  purchaseOrderItemId!: string;

  @ManyToOne(() => PurchaseOrderItemSchema)
  @JoinColumn({ name: 'purchaseOrderItemId' })
  purchaseOrderItem!: Relation<PurchaseOrderItemSchema>;

  @Column('decimal', { precision: 10, scale: 2 })
  receivedQuantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  acceptedQuantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  rejectedQuantity!: number;

  @Column('text', { nullable: true })
  batchNumber!: string;

  @Column('timestamp', { nullable: true })
  expiryDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
