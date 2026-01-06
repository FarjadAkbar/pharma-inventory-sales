import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity('proof_of_deliveries')
export class ProofOfDelivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  podNumber: string;

  @Column()
  @Index()
  shipmentId: number;

  @ManyToOne(() => Shipment, shipment => shipment.proofOfDeliveries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column()
  @Index()
  salesOrderId: number;

  @Column()
  salesOrderNumber: string;

  @Column('timestamp')
  deliveryDate: Date;

  @Column('timestamp', { nullable: true })
  actualDeliveryDate?: Date;

  @Column()
  deliveredBy: string;

  @Column()
  receivedBy: string;

  @Column({ nullable: true })
  receivedBySignature?: string;

  @Column({ type: 'jsonb', nullable: true })
  deliveryConditions?: {
    temperature?: number;
    humidity?: number;
    packagingCondition: 'Good' | 'Damaged' | 'Compromised';
    notes?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  itemsReceived?: Array<{
    drugId: number;
    drugName: string;
    drugCode: string;
    batchNumber: string;
    quantity: number;
    unit: string;
    condition: 'Good' | 'Damaged' | 'Missing';
    notes?: string;
  }>;

  @Column({ type: 'varchar', default: 'Pending' })
  status: 'Pending' | 'Completed' | 'Rejected';

  @Column({ nullable: true })
  rejectedReason?: string;

  @Column({ nullable: true })
  completedBy?: number;

  @Column({ nullable: true })
  completedByName?: string;

  @Column('timestamp', { nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

