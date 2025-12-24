import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { QCTestStatus } from '@repo/shared';
import { QCTestSpecification } from './qc-test-specification.entity';

@Entity('qc_tests')
export class QCTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  @Index()
  code?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  category?: string;

  @OneToMany(() => QCTestSpecification, (spec) => spec.test, { cascade: true })
  specifications: QCTestSpecification[];

  @Column({ type: 'varchar', default: QCTestStatus.ACTIVE })
  status: QCTestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

