import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  service?: string;

  @Column({ type: 'varchar' })
  @Index()
  entityType: string;

  @Column()
  @Index()
  entityId: number;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar', nullable: true })
  fromValue?: string | null;

  @Column({ type: 'varchar', nullable: true })
  toValue?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  diff?: Record<string, unknown> | null;

  @Column({ nullable: true })
  actorId?: number;

  @Column({ type: 'varchar', nullable: true })
  actorName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  correlationId?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

