import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ShipmentStatus, DistributionPriority } from '@repo/shared';
import { ShipmentItem } from './shipment-item.entity';
import { ProofOfDelivery } from './proof-of-delivery.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  shipmentNumber: string;

  @Column()
  @Index()
  salesOrderId: number;

  @Column()
  salesOrderNumber: string;

  @Column()
  @Index()
  accountId: number;

  @Column()
  accountName: string;

  @Column()
  @Index()
  siteId: number;

  @Column()
  siteName: string;

  @Column({ type: 'varchar', default: ShipmentStatus.DRAFT })
  status: ShipmentStatus;

  @Column({ type: 'varchar', default: DistributionPriority.NORMAL })
  priority: DistributionPriority;

  @Column('timestamp')
  shipmentDate: Date;

  @Column('timestamp')
  expectedDeliveryDate: Date;

  @Column('timestamp', { nullable: true })
  actualDeliveryDate?: Date;

  @Column({ nullable: true })
  @Index()
  trackingNumber?: string;

  @Column()
  carrier: string;

  @Column()
  serviceType: string;

  @Column({ type: 'jsonb' })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactPerson: string;
    phone: string;
    email: string;
    deliveryInstructions?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  packagingInstructions?: Array<{
    drugId: number;
    drugName: string;
    packagingType: string;
    quantity: number;
    unit: string;
    specialRequirements: string[];
    temperatureRange: {
      min: number;
      max: number;
      unit: string;
    };
    handlingInstructions: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  specialHandling?: Array<{
    type: 'Fragile' | 'Hazardous' | 'Temperature Sensitive' | 'Light Sensitive' | 'Other';
    description: string;
    instructions: string;
    required: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  temperatureRequirements?: {
    minTemperature: number;
    maxTemperature: number;
    unit: string;
    monitoringRequired: boolean;
    alertThreshold: number;
  };

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  createdByName?: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => ShipmentItem, item => item.shipment, { cascade: true })
  items: ShipmentItem[];

  @OneToMany(() => ProofOfDelivery, pod => pod.shipment, { cascade: true })
  proofOfDeliveries: ProofOfDelivery[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

