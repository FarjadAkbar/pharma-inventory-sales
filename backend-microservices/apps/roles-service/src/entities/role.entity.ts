import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  // Store permission IDs as array (since permissions are in a different database)
  // TypeORM simple-array stores as comma-separated string in DB, but we use it as number[]
  @Column('simple-array', { nullable: true, default: '' })
  permissionIds: number[] | string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

