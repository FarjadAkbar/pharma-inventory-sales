import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { QCTest } from './qc-test.entity';

@Entity('qc_test_specifications')
export class QCTestSpecification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  testId: number;

  @ManyToOne(() => QCTest, (test) => test.specifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testId' })
  test: QCTest;

  @Column()
  parameter: string;

  @Column({ nullable: true })
  minValue?: string;

  @Column({ nullable: true })
  maxValue?: string;

  @Column({ nullable: true })
  targetValue?: string;

  @Column()
  unit: string;

  @Column({ nullable: true })
  method?: string;
}

