import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true, default: '' })
  permissionIds: number[] | string;

  /**
   * When true, users with this role can only access data belonging to their
   * assigned siteIds. Used for: Site Manager, Cashier, Pharmacist, Store Supervisor.
   * When false (default), the role has system-wide visibility.
   */
  @Column({ default: false })
  isSiteScoped: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
