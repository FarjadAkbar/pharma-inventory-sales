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

@Entity('suppliers')
class Supplier {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column() email: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) address: string;
  @Column({ default: true }) isActive: boolean;
}

@Entity('raw_materials')
class RawMaterial {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ unique: true }) code: string;
  @Column({ nullable: true }) description: string;
  @Column() unit: string;
  @Column({ nullable: true }) supplierId: number;
}

@Entity('drugs')
class Drug {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ unique: true }) code: string;
  @Column({ nullable: true }) description: string;
  @Column() type: string;
  @Column() strength: string;
  @Column() unit: string;
}

@Entity('qc_tests')
class QCTest {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ unique: true }) code: string;
  @Column() category: string;
  @Column({ default: 'active' }) status: string;
}

@Entity('qc_samples')
class QCSample {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) sampleCode: string;
  @Column() materialId: number;
  @Column() materialName: string;
  @Column() batchNumber: string;
  @Column({ default: 'pending' }) status: string;
  @Column({ nullable: true }) collectedBy: number;
  @CreateDateColumn() createdAt: Date;
}

@Entity('qc_results')
class QCResult {
  @PrimaryGeneratedColumn() id: number;
  @Column() sampleId: number;
  @Column() testId: number;
  @Column() resultValue: string;
  @Column() unit: string;
  @Column() passed: boolean;
  @Column({ default: 'in_progress' }) status: string;
  @CreateDateColumn() createdAt: Date;
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
    database: process.env.SITE_DATABASE_NAME || 'pharma_sitesdb',
    entities: [Site],
    synchronize: true,
  });

  const supplierDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.SUPPLIER_DATABASE_NAME || 'pharma_supplierdb',
    entities: [Supplier],
    synchronize: true,
  });

  const rawMaterialDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.RAW_MATERIAL_DATABASE_NAME || 'pharma_rawmaterialdb',
    entities: [RawMaterial],
    synchronize: true,
  });

  const drugDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.DRUG_DATABASE_NAME || 'pharma_drugsdb',
    entities: [Drug],
    synchronize: true,
  });

  const qcDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.QUALITY_CONTROL_DATABASE_NAME || 'pharma_qualitycontroldb',
    entities: [QCTest, QCSample, QCResult],
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

    await supplierDataSource.initialize();
    console.log('Connected to suppliers database');

    await rawMaterialDataSource.initialize();
    console.log('Connected to raw materials database');

    await drugDataSource.initialize();
    console.log('Connected to drugs database');

    await qcDataSource.initialize();
    console.log('Connected to quality control database');

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

    // Seed Suppliers
    const supplierRepo = supplierDataSource.getRepository(Supplier);
    let suppliers: Supplier[] = [];
    if ((await supplierRepo.count()) === 0) {
      const newSuppliers = [
        { name: 'Pharma Chem Inc.', email: 'contact@pharmachem.com', address: '123 Chem Lane' },
        { name: 'Global API Suppliers', email: 'sales@globalapi.com', address: '456 API Blvd' },
      ];
      suppliers = await supplierRepo.save(newSuppliers);
      console.log('Seeded suppliers');
    } else {
      suppliers = await supplierRepo.find();
      console.log('Suppliers already exist');
    }

    // Seed Raw Materials
    const rawMaterialRepo = rawMaterialDataSource.getRepository(RawMaterial);
    if ((await rawMaterialRepo.count()) === 0 && suppliers.length > 0) {
      const materials = [
        { name: 'Paracetamol API', code: 'RM-PARA-001', unit: 'kg', supplierId: suppliers[0].id },
        { name: 'Ibuprofen API', code: 'RM-IBU-001', unit: 'kg', supplierId: suppliers[1].id },
        { name: 'Starch', code: 'RM-EXC-001', unit: 'kg', supplierId: suppliers[0].id },
      ];
      await rawMaterialRepo.save(materials);
      console.log('Seeded raw materials');
    } else {
      console.log('Raw materials already exist or no suppliers found');
    }

    // Seed Drugs
    const drugRepo = drugDataSource.getRepository(Drug);
    if ((await drugRepo.count()) === 0) {
      const drugs = [
        { name: 'Panadol', code: 'FG-PAN-500', type: 'Tablet', strength: '500mg', unit: 'box' },
        { name: 'Brufen', code: 'FG-BRU-400', type: 'Tablet', strength: '400mg', unit: 'box' },
      ];
      await drugRepo.save(drugs);
      console.log('Seeded drugs');
    } else {
      console.log('Drugs already exist');
    }

    // Seed QC Tests
    const qcTestRepo = qcDataSource.getRepository(QCTest);
    let tests: QCTest[] = [];
    if ((await qcTestRepo.count()) === 0) {
      const newTests = [
        { name: 'Assay', code: 'TEST-001', category: 'raw_material' },
        { name: 'pH', code: 'TEST-002', category: 'raw_material' },
        { name: 'Dissolution', code: 'TEST-003', category: 'finished_good' },
      ];
      tests = await qcTestRepo.save(newTests);
      console.log('Seeded QC tests');
    } else {
      tests = await qcTestRepo.find();
      console.log('QC tests already exist');
    }

    // Seed QC Samples and Results
    const qcSampleRepo = qcDataSource.getRepository(QCSample);
    const qcResultRepo = qcDataSource.getRepository(QCResult);
    
    if ((await qcSampleRepo.count()) === 0 && tests.length > 0) {
      // Sample 1: Paracetamol API
      const sample1 = qcSampleRepo.create({
        sampleCode: 'SMP-2024-001',
        materialId: 1, 
        materialName: 'Paracetamol API',
        batchNumber: 'BATCH-001',
        status: 'qc_complete',
        collectedBy: 1,
      });
      const savedSample1 = await qcSampleRepo.save(sample1);

      // Results for Sample 1
      const results1 = [
        { sampleId: savedSample1.id, testId: tests[0].id, resultValue: '99.5', unit: '%', passed: true, status: 'completed' },
        { sampleId: savedSample1.id, testId: tests[1].id, resultValue: '6.5', unit: 'pH', passed: true, status: 'completed' },
      ];
      await qcResultRepo.save(results1);

      // Sample 2: Panadol (Finished Good)
      const sample2 = qcSampleRepo.create({
        sampleCode: 'SMP-FG-2024-001',
        materialId: 1, 
        materialName: 'Panadol',
        batchNumber: 'BATCH-FG-001',
        status: 'pending',
        collectedBy: 1,
      });
      await qcSampleRepo.save(sample2);

      console.log('Seeded QC samples and results');
    } else {
      console.log('QC samples already exist or no tests found');
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
    await supplierDataSource.destroy();
    await rawMaterialDataSource.destroy();
    await drugDataSource.destroy();
    await qcDataSource.destroy();
  }
}

seed();

