import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { QARelease } from './qa-release.entity';

@Entity('qa_checklist_items')
export class QAChecklistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  releaseId: number;

  @ManyToOne(() => QARelease, (release) => release.checklistItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'releaseId' })
  release: QARelease;

  @Column()
  item: string;

  @Column({ default: false })
  checked: boolean;

  @Column({ type: 'text', nullable: true })
  remarks?: string;
}

