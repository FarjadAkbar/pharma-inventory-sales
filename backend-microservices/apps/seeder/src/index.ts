import { DataSource, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { hash } from '@node-rs/bcrypt';

// --- Shared Enums (Copied for Seeder Independence) ---

export enum DosageForm {
  TABLET = 'Tablet',
  CAPSULE = 'Capsule',
  SYRUP = 'Syrup',
  INJECTION = 'Injection',
}

export enum Route {
  ORAL = 'Oral',
  IV = 'IV',
  IM = 'IM',
  SC = 'SC',
}

export enum ApprovalStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  APPROVED = 'Approved',
}

export enum RawMaterialStatus {
  ACTIVE = 'Active',
  INACTIVE = 'InActive',
}

export enum InventoryStatus {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  QUARANTINE = 'Quarantine',
}

export enum BatchStatus {
  DRAFT = 'Draft',
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum SupplierStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum SiteType {
  HOSPITAL = 'hospital',
  CLINIC = 'clinic',
  PHARMACY = 'pharmacy',
  WAREHOUSE = 'warehouse',
  MANUFACTURING = 'manufacturing',
}

export enum DistributionPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
  URGENT = 'Urgent',
  EMERGENCY = 'Emergency',
}

export enum ShipmentStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  ALLOCATED = 'Allocated',
  PICKED = 'Picked',
  PACKED = 'Packed',
  SHIPPED = 'Shipped',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  RETURNED = 'Returned',
  CANCELLED = 'Cancelled',
}

export enum TransactionStatus {
  DRAFT = 'Draft',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum PaymentMethod {
  CASH = 'Cash',
  CARD = 'Card',
  BANK_TRANSFER = 'Bank Transfer',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
}

// --- Entity Definitions (Synchronized with Services) ---

@Entity('permissions')
class Permission {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) name: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) resource: string;
  @Column({ nullable: true }) action: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('roles')
class Role {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) name: string;
  @Column({ nullable: true }) description: string;
  @Column('simple-array', { nullable: true, default: '' }) permissionIds: number[] | string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('users')
class User {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ unique: true }) email: string;
  @Column() password: string;
  @Column({ nullable: true }) profilePicture: string;
  @Column({ nullable: true }) roleId: number;
  @Column('simple-array', { nullable: true, default: '' }) siteIds: number[] | string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('sites')
class Site {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column({ nullable: true }) address: string;
  @Column({ nullable: true }) city: string;
  @Column({ nullable: true }) country: string;
  @Column({ type: 'enum', enum: SiteType, nullable: true }) type: SiteType;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('suppliers')
class Supplier {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
  @Column() contactPerson: string;
  @Column() email: string;
  @Column() phone: string;
  @Column() address: string;
  @Column('decimal', { precision: 2, scale: 1, default: 0 }) rating: number;
  @Column({ type: 'varchar', default: SupplierStatus.ACTIVE }) status: SupplierStatus;
  @Column('simple-array', { nullable: true }) siteIds: number[] | string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('raw_materials')
class RawMaterial {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, nullable: true }) code: string;
  @Column({ nullable: true }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ nullable: true }) grade: string;
  @Column({ type: 'text', nullable: true }) storageRequirements: string;
  @Column({ nullable: true }) unit: string;
  @Column({ nullable: true }) supplierId: number;
  @Column({ type: 'varchar', default: RawMaterialStatus.ACTIVE, nullable: true }) status: RawMaterialStatus;
}

@Entity('drugs')
class Drug {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, nullable: true }) code: string;
  @Column({ nullable: true }) name: string;
  @Column({ type: 'text', nullable: true }) formula: string;
  @Column({ nullable: true }) strength: string;
  @Column({ type: 'varchar', nullable: true }) dosageForm: DosageForm;
  @Column({ type: 'varchar', nullable: true }) route: Route;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'varchar', default: ApprovalStatus.APPROVED, nullable: true }) approvalStatus: ApprovalStatus;
  @Column({ nullable: true }) therapeuticClass: string;
  @Column({ nullable: true }) manufacturer: string;
  @Column({ nullable: true }) registrationNumber: string;
  @Column('timestamp', { nullable: true }) expiryDate: Date;
  @Column({ type: 'text', nullable: true }) storageConditions: string;
  @Column({ nullable: true }) createdBy: number;
}

@Entity('inventory_items')
class InventoryItem {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, nullable: true }) itemCode: string;
  @Column({ nullable: true }) materialId: number;
  @Column({ nullable: true }) materialName: string;
  @Column({ nullable: true }) materialCode: string;
  @Column({ nullable: true }) batchNumber: string;
  @Column('decimal', { precision: 10, scale: 2, nullable: true }) quantity: number;
  @Column({ nullable: true }) unit: string;
  @Column({ type: 'varchar', default: InventoryStatus.AVAILABLE, nullable: true }) status: InventoryStatus;
  @Column({ nullable: true }) zone: string;
  @Column({ nullable: true }) rack: string;
  @Column({ nullable: true }) shelf: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('batches')
class Batch {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, nullable: true }) batchNumber: string;
  @Column({ nullable: true }) drugId: number;
  @Column({ nullable: true }) drugName: string;
  @Column({ nullable: true }) drugCode: string;
  @Column({ nullable: true }) siteId: number;
  @Column({ nullable: true }) siteName: string;
  @Column('decimal', { precision: 10, scale: 2, nullable: true }) plannedQuantity: number;
  @Column({ type: 'varchar', default: BatchStatus.IN_PROGRESS, nullable: true }) status: BatchStatus;
  @Column('timestamp', { nullable: true }) plannedStartDate: Date;
  @Column('timestamp', { nullable: true }) plannedEndDate: Date;
  @Column({ nullable: true }) createdBy: number;
}

@Entity('pos_transactions')
class POSTransaction {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, nullable: true }) transactionNumber: string;
  @Column({ nullable: true }) terminalId: string;
  @Column({ nullable: true }) terminalName: string;
  @Column({ nullable: true }) siteId: number;
  @Column({ nullable: true }) siteName: string;
  @Column({ nullable: true }) cashierId: number;
  @Column({ nullable: true }) cashierName: string;
  @Column({ nullable: true }) customerName: string;
  @Column({ type: 'jsonb', nullable: true }) items: any[];
  @Column('decimal', { precision: 10, scale: 2, nullable: true }) subtotal: number;
  @Column('decimal', { precision: 10, scale: 2, nullable: true }) tax: number;
  @Column('decimal', { precision: 10, scale: 2, nullable: true }) total: number;
  @Column({ type: 'varchar', nullable: true }) paymentMethod: PaymentMethod;
  @Column({ type: 'varchar', nullable: true }) paymentStatus: PaymentStatus;
  @Column({ type: 'varchar', nullable: true }) status: TransactionStatus;
  @Column('timestamp', { nullable: true }) transactionDate: Date;
  @Column({ nullable: true }) createdBy: number;
}

@Entity('shipments')
class Shipment {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) shipmentNumber: string;
  @Column() salesOrderId: number;
  @Column() salesOrderNumber: string;
  @Column() accountId: number;
  @Column() accountName: string;
  @Column() siteId: number;
  @Column() siteName: string;
  @Column({ type: 'varchar', default: ShipmentStatus.DRAFT }) status: ShipmentStatus;
  @Column({ type: 'varchar', default: DistributionPriority.NORMAL }) priority: DistributionPriority;
  @Column('timestamp') shipmentDate: Date;
  @Column('timestamp') expectedDeliveryDate: Date;
  @Column('timestamp', { nullable: true }) actualDeliveryDate: Date;
  @Column({ nullable: true }) trackingNumber: string;
  @Column() carrier: string;
  @Column() serviceType: string;
  @Column({ type: 'jsonb' }) shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactPerson: string;
    phone: string;
    email: string;
    deliveryInstructions?: string;
  };
  @Column({ type: 'jsonb', nullable: true }) packagingInstructions: any;
  @Column({ type: 'jsonb', nullable: true }) specialHandling: any;
  @Column({ type: 'jsonb', nullable: true }) temperatureRequirements: any;
  @Column() createdBy: number;
  @Column({ nullable: true }) createdByName: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// --- Seeding Logic ---

async function seed() {
  const commonConfig = {
    type: 'postgres' as const,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123',
    synchronize: true,
  };

  const dataSources = {
    permissions: new DataSource({ ...commonConfig, database: 'pharma_permissionsdb', entities: [Permission] }),
    roles: new DataSource({ ...commonConfig, database: 'pharma_rolesdb', entities: [Role] }),
    users: new DataSource({ ...commonConfig, database: 'pharma_userdb', entities: [User] }),
    sites: new DataSource({ ...commonConfig, database: 'pharma_sitesdb', entities: [Site] }),
    suppliers: new DataSource({ ...commonConfig, database: 'pharma_supplierdb', entities: [Supplier] }),
    rawMaterials: new DataSource({ ...commonConfig, database: 'pharma_rawmaterialdb', entities: [RawMaterial] }),
    drugs: new DataSource({ ...commonConfig, database: 'pharma_drugsdb', entities: [Drug] }),
    warehouse: new DataSource({ ...commonConfig, database: 'pharma_warehousedb', entities: [InventoryItem] }),
    manufacturing: new DataSource({ ...commonConfig, database: 'pharma_manufacturingdb', entities: [Batch] }),
    shipment: new DataSource({ ...commonConfig, database: 'pharma_shippmentdb', entities: [Shipment] }),
    sales: new DataSource({ ...commonConfig, database: 'pharma_salescrmdb', entities: [POSTransaction] }),
  };

  try {
    for (const [name, ds] of Object.entries(dataSources)) {
      await ds.initialize();
      console.log(`Connected to ${name} database`);
    }

    // 1. Permissions
    const permissionRepo = dataSources.permissions.getRepository(Permission);
    if ((await permissionRepo.count()) === 0) {
      const permissions = [
        // Users & Roles
        { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
        { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' },
        { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
        { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
        { name: 'roles.create', description: 'Create roles', resource: 'roles', action: 'create' },
        { name: 'roles.read', description: 'Read roles', resource: 'roles', action: 'read' },
        { name: 'roles.update', description: 'Update roles', resource: 'roles', action: 'update' },
        { name: 'roles.delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
        
        // Products (Drugs & Raw Materials)
        { name: 'drugs.create', description: 'Create drugs', resource: 'drugs', action: 'create' },
        { name: 'drugs.read', description: 'Read drugs', resource: 'drugs', action: 'read' },
        { name: 'raw_materials.read', description: 'Read raw materials', resource: 'raw_materials', action: 'read' },
        
        // Manufacturing
        { name: 'manufacturing.create', description: 'Create batches', resource: 'manufacturing', action: 'create' },
        { name: 'manufacturing.read', description: 'Read batches', resource: 'manufacturing', action: 'read' },
        { name: 'manufacturing.update', description: 'Update batches', resource: 'manufacturing', action: 'update' },
        
        // Warehouse & Inventory
        { name: 'inventory.read', description: 'Read inventory', resource: 'inventory', action: 'read' },
        { name: 'inventory.update', description: 'Update inventory', resource: 'inventory', action: 'update' },
        
        // Sales & POS
        { name: 'sales.create', description: 'Create sales', resource: 'sales', action: 'create' },
        { name: 'sales.read', description: 'Read sales', resource: 'sales', action: 'read' },
        
        // Distribution & Shipments
        { name: 'shipments.create', description: 'Create shipments', resource: 'shipments', action: 'create' },
        { name: 'shipments.read', description: 'Read shipments', resource: 'shipments', action: 'read' },
        { name: 'shipments.update', description: 'Update shipments', resource: 'shipments', action: 'update' },
      ];
      await permissionRepo.save(permissions);
      console.log('Seeded permissions');
    }
    const dbPermissions = await permissionRepo.find();

    // 2. Roles
    const roleRepo = dataSources.roles.getRepository(Role);
    if ((await roleRepo.count()) === 0) {
      const allPermissionIds = dbPermissions.map(p => p.id);
      
      const getPIds = (patterns: string[]) => 
        dbPermissions.filter(p => patterns.some(pattern => p.name.includes(pattern))).map(p => p.id);

      const roles = [
        { 
          name: 'Admin', 
          description: 'System Administrator', 
          permissionIds: allPermissionIds 
        },
        { 
          name: 'Procurement Manager', 
          description: 'Handles raw material sourcing', 
          permissionIds: getPIds(['raw_materials', 'inventory.read']) 
        },
        { 
          name: 'Production Manager', 
          description: 'Oversees manufacturing', 
          permissionIds: getPIds(['manufacturing', 'drugs.read', 'inventory.read']) 
        },
        { 
          name: 'QC Manager', 
          description: 'Quality Control lead', 
          permissionIds: getPIds(['manufacturing.read', 'drugs.read', 'inventory.read']) 
        },
        { 
          name: 'QA Manager', 
          description: 'Quality Assurance lead', 
          permissionIds: getPIds(['manufacturing.read', 'drugs.read', 'inventory.read']) 
        },
        { 
          name: 'Warehouse Operator', 
          description: 'Inventory management', 
          permissionIds: getPIds(['inventory', 'shipments.read']) 
        },
        { 
          name: 'Distribution Operator', 
          description: 'Logistics and delivery', 
          permissionIds: getPIds(['shipments', 'inventory.read']) 
        },
        { 
          name: 'Sales Representative', 
          description: 'POS and CRM', 
          permissionIds: getPIds(['sales', 'drugs.read', 'inventory.read']) 
        },
      ];
      await roleRepo.save(roles);
      console.log('Seeded roles with permission associations');
    }
    const dbRoles = await roleRepo.find();

    // 3. Sites
    const siteRepo = dataSources.sites.getRepository(Site);
    if ((await siteRepo.count()) === 0) {
      await siteRepo.save([
        { name: 'Ziauddin Pharma Site Karachi', address: '4/B, Block 6, PECHS', city: 'Karachi', country: 'Pakistan', type: SiteType.MANUFACTURING },
        { name: 'North Warehouse', address: 'Plot 10, Sector 12, Korangi', city: 'Karachi', country: 'Pakistan', type: SiteType.WAREHOUSE },
        { name: 'City Retail Pharmacy', address: 'Shop 2, Plaza 5, Blue Area', city: 'Islamabad', country: 'Pakistan', type: SiteType.PHARMACY },
      ]);
      console.log('Seeded sites');
    }
    const dbSites = await siteRepo.find();

    // 4. Users
    const userRepo = dataSources.users.getRepository(User);
    if ((await userRepo.count()) === 0) {
      const hashedPassword = await hash('admin123', 10);
      const users = dbRoles.map((role, i) => ({
        name: `${role.name} User`,
        email: `${role.name.toLowerCase().replace(' ', '.')}@example.com`,
        password: hashedPassword,
        roleId: role.id,
        siteIds: [dbSites[i % dbSites.length].id],
        profilePicture: `https://ui-avatars.com/api/?name=${role.name.replace(' ', '+')}&background=random`,
      }));
      // Add standard admin
      users.push({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        roleId: dbRoles.find(r => r.name === 'Admin')?.id || 1,
        siteIds: dbSites.map(s => s.id),
        profilePicture: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
      });
      await userRepo.save(users);
      console.log('Seeded users with full profiles');
    }
    const dbUsers = await userRepo.find();
    const adminUser = dbUsers.find(u => u.email === 'admin@example.com')!;

    // 5. Master Data
    const supplierRepo = dataSources.suppliers.getRepository(Supplier);
    if ((await supplierRepo.count()) === 0) {
      await supplierRepo.save([
        {
          name: 'Global API Corp',
          contactPerson: 'John Smith',
          email: 'sales@globalapi.com',
          phone: '+123456789',
          address: 'New York, USA',
          rating: 4.5,
          status: SupplierStatus.ACTIVE,
          siteIds: dbSites.length ? [dbSites[0].id] : [],
        },
        {
          name: 'ChemSupply Ltd',
          contactPerson: 'Ahmed Khan',
          email: 'info@chemsupply.pk',
          phone: '+9230000000',
          address: 'Lahore, Pakistan',
          rating: 4.0,
          status: SupplierStatus.ACTIVE,
          siteIds: dbSites.length ? [dbSites[0].id, dbSites[1].id] : [],
        },
      ]);
      console.log('Seeded suppliers');
    }
    const dbSuppliers = await supplierRepo.find();

    const rmRepo = dataSources.rawMaterials.getRepository(RawMaterial);
    if ((await rmRepo.count()) === 0) {
      await rmRepo.save([
        { 
          code: 'RM-PARA-500', name: 'Paracetamol BP/USP', description: 'Active Pharmaceutical Ingredient', 
          grade: 'Pharmaceutical Grade', storageRequirements: 'Store in a cool dry place below 30°C', 
          unit: 'kg', supplierId: dbSuppliers[0].id, status: RawMaterialStatus.ACTIVE 
        },
        { 
          code: 'RM-STARCH-01', name: 'Maize Starch', description: 'Excipient / Disintegrant', 
          grade: 'USP', storageRequirements: 'Protect from moisture', 
          unit: 'kg', supplierId: dbSuppliers[1].id, status: RawMaterialStatus.ACTIVE 
        },
      ]);
      console.log('Seeded raw materials');
    }

    const drugRepo = dataSources.drugs.getRepository(Drug);
    if ((await drugRepo.count()) === 0) {
      await drugRepo.save([
        {
          code: 'DRG-PAN-500', name: 'Panadol Forte', formula: 'Paracetamol 500mg', strength: '500mg',
          dosageForm: DosageForm.TABLET, route: Route.ORAL, description: 'Mild to moderate pain reliever',
          therapeuticClass: 'Analgesic', manufacturer: 'Ziauddin Pharma', registrationNumber: 'DRAP-0123',
          expiryDate: new Date('2026-12-01'), storageConditions: 'Store below 25°C', createdBy: adminUser.id
        },
        {
          code: 'DRG-AMX-250', name: 'Amoxil', formula: 'Amoxicillin 250mg', strength: '250mg',
          dosageForm: DosageForm.CAPSULE, route: Route.ORAL, description: 'Broad spectrum penicillin antibiotic',
          therapeuticClass: 'Anti-infective', manufacturer: 'Ziauddin Pharma', registrationNumber: 'DRAP-0456',
          expiryDate: new Date('2025-06-01'), storageConditions: 'Protect from heat and light', createdBy: adminUser.id
        }
      ]);
      console.log('Seeded drugs');
    }
    const dbDrugs = await drugRepo.find();

    // 6. Transactional Data
    const invRepo = dataSources.warehouse.getRepository(InventoryItem);
    if ((await invRepo.count()) === 0) {
      await invRepo.save([
        { 
          itemCode: 'INV-001', materialId: dbDrugs[0].id, materialName: dbDrugs[0].name, materialCode: dbDrugs[0].code,
          batchNumber: 'B-PAN-001', quantity: 5000, unit: 'Tablets', status: InventoryStatus.AVAILABLE,
          zone: 'A', rack: 'R1', shelf: 'S2'
        },
        { 
          itemCode: 'INV-002', materialId: dbDrugs[1].id, materialName: dbDrugs[1].name, materialCode: dbDrugs[1].code,
          batchNumber: 'B-AMX-102', quantity: 1200, unit: 'Capsules', status: InventoryStatus.AVAILABLE,
          zone: 'B', rack: 'R4', shelf: 'S1'
        }
      ]);
      console.log('Seeded inventory');
    }

    const batchRepo = dataSources.manufacturing.getRepository(Batch);
    if ((await batchRepo.count()) === 0) {
      await batchRepo.save([
        {
          batchNumber: 'BAT-2024-XP', drugId: dbDrugs[0].id, drugName: dbDrugs[0].name, drugCode: dbDrugs[0].code,
          siteId: dbSites[0].id, siteName: dbSites[0].name, plannedQuantity: 50000, status: BatchStatus.IN_PROGRESS,
          plannedStartDate: new Date(), plannedEndDate: new Date(Date.now() + 7 * 86400000), createdBy: adminUser.id
        }
      ]);
      console.log('Seeded batches');
    }

    const salesRepo = dataSources.sales.getRepository(POSTransaction);
    if ((await salesRepo.count()) === 0) {
      await salesRepo.save([
        {
          transactionNumber: 'TX-10001', terminalId: 'TERM-01', terminalName: 'Front Desk 1',
          siteId: dbSites[2].id, siteName: dbSites[2].name, cashierId: adminUser.id, cashierName: adminUser.name,
          customerName: 'Walk-in Customer', items: [{ productId: 'DRG-PAN-500', productName: 'Panadol Forte', quantity: 2, unitPrice: 15, totalPrice: 30 }],
          subtotal: 30, tax: 2, total: 32, paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PAID,
          status: TransactionStatus.COMPLETED, transactionDate: new Date(), createdBy: adminUser.id
        }
      ]);
      console.log('Seeded sales');
    }

    const shipRepo = dataSources.shipment.getRepository(Shipment);
    if ((await shipRepo.count()) === 0) {
      const shippingAddress = {
        street: 'Main Blvd',
        city: 'Karachi',
        state: 'Sindh',
        postalCode: '75000',
        country: 'Pakistan',
        contactPerson: 'Mr. Ali',
        phone: '0300123',
        email: 'ali@hosp.com',
      };
      await shipRepo.save([
        {
          shipmentNumber: 'SHP-9001',
          salesOrderId: 1,
          salesOrderNumber: 'SO-5001',
          accountId: 1,
          accountName: 'General Hospital',
          siteId: dbSites[1].id,
          siteName: dbSites[1].name,
          status: ShipmentStatus.IN_TRANSIT,
          priority: DistributionPriority.NORMAL,
          shipmentDate: new Date(),
          expectedDeliveryDate: new Date(Date.now() + 2 * 86400000),
          carrier: 'PharmaExpress',
          serviceType: 'Standard Delivery',
          shippingAddress,
          createdBy: adminUser.id,
          createdByName: adminUser.name,
        },
      ]);
      console.log('Seeded shipments');
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    for (const ds of Object.values(dataSources)) {
      if (ds.isInitialized) await ds.destroy();
    }
  }
}

seed();
