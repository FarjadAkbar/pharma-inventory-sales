import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { GoodsReceiptItem } from './goods-receipt-item.entity';
import { GoodsReceiptStatus } from '@repo/shared';

@Entity('goods_receipts')
export class GoodsReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  grnNumber: string;

  @Column()
  @Index()
  purchaseOrderId: number;

  @Column('timestamp')
  receivedDate: Date;

  @Column({ type: 'varchar', default: GoodsReceiptStatus.DRAFT })
  status: GoodsReceiptStatus;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => GoodsReceiptItem, (item) => item.goodsReceipt, { cascade: true })
  items: GoodsReceiptItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

