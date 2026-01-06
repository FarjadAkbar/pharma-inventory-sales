import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ShipmentItemStatus } from '@repo/shared';
import { Shipment } from './shipment.entity';

@Entity('shipment_items')
export class ShipmentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  shipmentId: number;

  @ManyToOne(() => Shipment, shipment => shipment.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column()
  @Index()
  drugId: number;

  @Column()
  drugName: string;

  @Column()
  drugCode: string;

  @Column()
  batchNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  @Column({ nullable: true })
  location?: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  pickedQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  packedQuantity: number;

  @Column({ type: 'varchar', default: ShipmentItemStatus.PENDING })
  status: ShipmentItemStatus;

  @Column({ nullable: true })
  pickedBy?: number;

  @Column({ nullable: true })
  pickedByName?: string;

  @Column('timestamp', { nullable: true })
  pickedAt?: Date;

  @Column({ nullable: true })
  packedBy?: number;

  @Column({ nullable: true })
  packedByName?: string;

  @Column('timestamp', { nullable: true })
  packedAt?: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

