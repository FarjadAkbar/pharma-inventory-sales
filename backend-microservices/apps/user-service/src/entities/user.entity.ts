import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  roleId: number;

  // Store site IDs as array (since sites are in a different database)
  // TypeORM simple-array stores as comma-separated string in DB, but we use it as number[]
  @Column('simple-array', { nullable: true, default: '' })
  siteIds: number[] | string;

  // Note: Role and Site relationships are handled via microservice communication
  // since they are in different databases

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}