import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('status_history')
export class StatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  @Index()
  entityType: string;

  @Column()
  @Index()
  entityId: number;

  @Column({ type: 'varchar', nullable: true })
  fromStatus?: string | null;

  @Column({ type: 'varchar' })
  toStatus: string;

  @Column({ nullable: true })
  changedBy?: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn()
  changedAt: Date;
}

