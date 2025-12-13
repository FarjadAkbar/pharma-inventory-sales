    import { DataSource, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { hash } from '@node-rs/bcrypt';

// Define entities inline since we can't import from other services easily
@Entity('permissions')
class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  resource: string;

  @Column({ nullable: true })
  action: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('roles')
class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  roleId: number;

  @Column('simple-array', { nullable: true, default: '' })
  siteIds: number[] | string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('sites')
class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: 'enum',
    enum: ['hospital', 'clinic', 'pharmacy', 'warehouse', 'manufacturing'],
    nullable: true,
  })
  type: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

async function seed() {
  // Create data sources for each service database
  const permissionDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.PERMISSION_DATABASE_NAME || 'pharma_permissionsdb',
    entities: [Permission],
    synchronize: true,
  });

  const roleDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.ROLE_DATABASE_NAME || 'pharma_rolesdb',
    entities: [Role],
    synchronize: true,
  });

  const userDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.USER_DATABASE_NAME || 'pharma_userdb',
    entities: [User],
    synchronize: true,
  });

  const siteDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.SITE_DATABASE_NAME || 'sites_db',
    entities: [Site],
    synchronize: true,
  });

  try {
    // Initialize connections
    await permissionDataSource.initialize();
    console.log('Connected to permissions database');
    
    await roleDataSource.initialize();
    console.log('Connected to roles database');
    
    await userDataSource.initialize();
    console.log('Connected to users database');
    
    await siteDataSource.initialize();
    console.log('Connected to sites database');

    // Seed Permissions
    const permissionRepo = permissionDataSource.getRepository(Permission);
    const existingPermissions = await permissionRepo.find();
    
    if (existingPermissions.length === 0) {
      const permissions = [
        { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
        { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' },
        { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
        { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
        { name: 'roles.create', description: 'Create roles', resource: 'roles', action: 'create' },
        { name: 'roles.read', description: 'Read roles', resource: 'roles', action: 'read' },
        { name: 'roles.update', description: 'Update roles', resource: 'roles', action: 'update' },
        { name: 'roles.delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
        { name: 'permissions.create', description: 'Create permissions', resource: 'permissions', action: 'create' },
        { name: 'permissions.read', description: 'Read permissions', resource: 'permissions', action: 'read' },
        { name: 'permissions.update', description: 'Update permissions', resource: 'permissions', action: 'update' },
        { name: 'permissions.delete', description: 'Delete permissions', resource: 'permissions', action: 'delete' },
      ];

      await permissionRepo.save(permissions);
      console.log('Seeded permissions');
    } else {
      console.log('Permissions already exist, skipping...');
    }

    // Seed Roles
    const roleRepo = roleDataSource.getRepository(Role);
    const existingRoles = await roleRepo.find();
    
    if (existingRoles.length === 0) {
      const adminRole = roleRepo.create({
        name: 'Admin',
        description: 'System Administrator with all permissions',
      });
      await roleRepo.save(adminRole);
      console.log('Seeded roles');
    } else {
      console.log('Roles already exist, skipping...');
    }

    // Seed Sites
    const siteRepo = siteDataSource.getRepository(Site);
    const existingSites = await siteRepo.find();
    
    if (existingSites.length === 0) {
      const sites = [
        {
          name: 'Ziauddin Hospital - Clifton',
          address: '4/B, Block 6, PECHS, Karachi',
          city: 'Karachi',
          country: 'Pakistan',
          type: 'hospital',
          isActive: true,
        },
        {
          name: 'Ziauddin Hospital - North Nazimabad',
          address: 'Plot No. 1, Block A, North Nazimabad, Karachi',
          city: 'Karachi',
          country: 'Pakistan',
          type: 'hospital',
          isActive: true,
        },
        {
          name: 'Ziauddin Hospital - Kemari',
          address: 'Plot No. 1, Block 1, Kemari, Karachi',
          city: 'Karachi',
          country: 'Pakistan',
          type: 'hospital',
          isActive: true,
        },
        {
          name: 'Central Warehouse - Karachi',
          address: 'Industrial Area, Karachi',
          city: 'Karachi',
          country: 'Pakistan',
          type: 'warehouse',
          isActive: true,
        },
        {
          name: 'Manufacturing Plant - Lahore',
          address: 'Pharmaceutical Zone, Lahore',
          city: 'Lahore',
          country: 'Pakistan',
          type: 'manufacturing',
          isActive: true,
        },
      ];
      await siteRepo.save(sites);
      console.log('Seeded sites');
    } else {
      console.log('Sites already exist, skipping...');
    }

    // Seed Users
    const userRepo = userDataSource.getRepository(User);
    const existingUsers = await userRepo.find();
    
    if (existingUsers.length === 0) {
      const hashedPassword = await hash('admin123', 10);
      // Admin user doesn't have sites assigned
      const adminUser = userRepo.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        roleId: 1, // Assuming Admin role has ID 1
        siteIds: '', // Admin has no sites assigned
      });
      await userRepo.save(adminUser);
      console.log('Seeded users');
    } else {
      console.log('Users already exist, skipping...');
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await permissionDataSource.destroy();
    await roleDataSource.destroy();
    await userDataSource.destroy();
    await siteDataSource.destroy();
  }
}

seed();

