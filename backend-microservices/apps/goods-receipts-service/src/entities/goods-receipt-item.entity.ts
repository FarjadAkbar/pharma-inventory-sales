import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { GoodsReceipt } from './goods-receipt.entity';

@Entity('goods_receipt_items')
export class GoodsReceiptItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  goodsReceiptId: number;

  @ManyToOne(() => GoodsReceipt, (gr) => gr.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goodsReceiptId' })
  goodsReceipt: GoodsReceipt;

  @Column()
  @Index()
  purchaseOrderItemId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  receivedQuantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  acceptedQuantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  rejectedQuantity: number;

  @Column({ type: 'varchar', nullable: true })
  batchNumber?: string;

  @Column('timestamp', { nullable: true })
  expiryDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

