import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SupplierStatus } from '@repo/shared';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  contactPerson: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'varchar', default: SupplierStatus.ACTIVE })
  status: SupplierStatus;

  @Column('simple-array', { nullable: true })
  siteIds: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

