import { BaseEntity, Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'sites' })
export class SiteSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column({ type: String, nullable: false })
  name!: string;

  @Column({ type: String, nullable: true })
  location!: string;

  @Column({ type: Boolean, default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
