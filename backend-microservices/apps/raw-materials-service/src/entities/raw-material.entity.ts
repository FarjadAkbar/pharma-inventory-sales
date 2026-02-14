import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RawMaterialStatus } from '@repo/shared';

@Entity('raw_materials')
export class RawMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ type: 'text', nullable: true })
  storageRequirements: string;

  @Column({ nullable: true })
  unit: string;

  @Column()
  @Index()
  supplierId: number;

  @Column({ type: 'varchar', default: RawMaterialStatus.ACTIVE })
  status: RawMaterialStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

