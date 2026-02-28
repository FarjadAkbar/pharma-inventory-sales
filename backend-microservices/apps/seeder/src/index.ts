import { DataSource, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { hash } from '@node-rs/bcrypt';

// --- Shared Enums ---

export enum DosageForm { TABLET = 'Tablet', CAPSULE = 'Capsule', SYRUP = 'Syrup', INJECTION = 'Injection' }
export enum Route { ORAL = 'Oral', IV = 'IV', IM = 'IM', SC = 'SC' }
export enum ApprovalStatus { DRAFT = 'Draft', PENDING = 'Pending', APPROVED = 'Approved' }
export enum RawMaterialStatus { ACTIVE = 'Active', INACTIVE = 'InActive' }
export enum InventoryStatus { AVAILABLE = 'Available', RESERVED = 'Reserved', QUARANTINE = 'Quarantine' }
export enum BatchStatus { DRAFT = 'Draft', PLANNED = 'Planned', IN_PROGRESS = 'In Progress', COMPLETED = 'Completed' }
export enum SupplierStatus { ACTIVE = 'Active', INACTIVE = 'Inactive' }
export enum SiteType { HOSPITAL = 'hospital', CLINIC = 'clinic', PHARMACY = 'pharmacy', WAREHOUSE = 'warehouse', MANUFACTURING = 'manufacturing' }
export enum DistributionPriority { LOW = 'Low', NORMAL = 'Normal', HIGH = 'High', URGENT = 'Urgent', EMERGENCY = 'Emergency' }
export enum ShipmentStatus { DRAFT = 'Draft', PENDING = 'Pending', IN_PROGRESS = 'In Progress', ALLOCATED = 'Allocated', PICKED = 'Picked', PACKED = 'Packed', SHIPPED = 'Shipped', IN_TRANSIT = 'In Transit', DELIVERED = 'Delivered', RETURNED = 'Returned', CANCELLED = 'Cancelled' }
export enum TransactionStatus { DRAFT = 'Draft', COMPLETED = 'Completed', CANCELLED = 'Cancelled' }
export enum PaymentMethod { CASH = 'Cash', CARD = 'Card', BANK_TRANSFER = 'Bank Transfer' }
export enum PaymentStatus { PENDING = 'Pending', PAID = 'Paid', FAILED = 'Failed' }

// --- Entity Definitions ---

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
  /**
   * isSiteScoped = true means users with this role can ONLY see data
   * belonging to their assigned sites. Useful for Site Managers and Cashiers.
   */
  @Column({ default: false }) isSiteScoped: boolean;
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
  /**
   * Comma-separated site IDs this user is assigned to.
   * An employee can be shifted between sites by updating this field.
   */
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
  @Column({ type: 'jsonb' }) shippingAddress: object;
  @Column({ type: 'jsonb', nullable: true }) packagingInstructions: any;
  @Column({ type: 'jsonb', nullable: true }) specialHandling: any;
  @Column({ type: 'jsonb', nullable: true }) temperatureRequirements: any;
  @Column() createdBy: number;
  @Column({ nullable: true }) createdByName: string;
  @Column({ type: 'text', nullable: true }) remarks: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// ─────────────────────────────────────────────
//   SEEDING LOGIC
// ─────────────────────────────────────────────

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
    roles:       new DataSource({ ...commonConfig, database: 'pharma_rolesdb',        entities: [Role] }),
    users:       new DataSource({ ...commonConfig, database: 'pharma_userdb',         entities: [User] }),
    sites:       new DataSource({ ...commonConfig, database: 'pharma_sitesdb',        entities: [Site] }),
    suppliers:   new DataSource({ ...commonConfig, database: 'pharma_supplierdb',     entities: [Supplier] }),
    rawMaterials: new DataSource({ ...commonConfig, database: 'pharma_rawmaterialdb', entities: [RawMaterial] }),
    drugs:       new DataSource({ ...commonConfig, database: 'pharma_drugsdb',        entities: [Drug] }),
    warehouse:   new DataSource({ ...commonConfig, database: 'pharma_warehousedb',    entities: [InventoryItem] }),
    manufacturing: new DataSource({ ...commonConfig, database: 'pharma_manufacturingdb', entities: [Batch] }),
    shipment:    new DataSource({ ...commonConfig, database: 'pharma_shippmentdb',    entities: [Shipment] }),
    sales:       new DataSource({ ...commonConfig, database: 'pharma_salescrmdb',     entities: [POSTransaction] }),
  };

  try {
    for (const [name, ds] of Object.entries(dataSources)) {
      await ds.initialize();
      console.log(`✅ Connected to ${name} database`);
    }

    // ──────────────────────────────────────────
    // 1. PERMISSIONS  (comprehensive, granular)
    // ──────────────────────────────────────────
    const permissionRepo = dataSources.permissions.getRepository(Permission);
    if ((await permissionRepo.count()) === 0) {

      const define = (resource: string, actions: string[], extraDescriptions: Record<string, string> = {}) =>
        actions.map(action => ({
          name: `${resource}.${action}`,
          description: extraDescriptions[action] || `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.replace(/_/g, ' ')}`,
          resource,
          action,
        }));

      const permissions = [
        // ── Identity & Access ──
        ...define('users',       ['create', 'read', 'update', 'delete', 'export', 'reset_password', 'assign_site']),
        ...define('roles',       ['create', 'read', 'update', 'delete', 'assign_permissions']),
        ...define('permissions', ['create', 'read', 'update', 'delete']),
        ...define('sites',       ['create', 'read', 'update', 'delete', 'assign_users']),

        // ── Master Data ──
        ...define('drugs',        ['create', 'read', 'update', 'delete', 'approve', 'reject', 'export']),
        ...define('raw_materials',['create', 'read', 'update', 'delete', 'import', 'export', 'approve']),
        ...define('suppliers',    ['create', 'read', 'update', 'delete', 'rate', 'export']),
        ...define('equipment',    ['create', 'read', 'update', 'delete']),
        ...define('units',        ['create', 'read', 'update', 'delete']),

        // ── Procurement ──
        ...define('purchase_orders',  ['create', 'read', 'update', 'delete', 'approve', 'reject', 'cancel', 'export']),
        ...define('goods_receipts',   ['create', 'read', 'update', 'delete', 'verify']),
        ...define('supplier_invoices',['create', 'read', 'update', 'delete', 'approve', 'export']),
        ...define('coa',              ['create', 'read', 'update', 'delete', 'approve', 'reject']),

        // ── Manufacturing ──
        ...define('boms',          ['create', 'read', 'update', 'delete', 'approve', 'version']),
        ...define('work_orders',   ['create', 'read', 'update', 'delete', 'start', 'complete', 'cancel']),
        ...define('batches',       ['create', 'read', 'update', 'delete', 'start', 'complete', 'release', 'export']),
        ...define('batch_steps',   ['create', 'read', 'update', 'execute']),
        ...define('consumptions',  ['create', 'read', 'update', 'delete']),
        ...define('ebr',           ['read', 'approve', 'reject', 'export']),

        // ── Quality Control ──
        ...define('qc_tests',      ['create', 'read', 'update', 'delete', 'execute', 'approve']),
        ...define('qc_samples',    ['create', 'read', 'update', 'delete', 'receive']),
        ...define('qc_results',    ['create', 'read', 'update', 'delete', 'approve', 'submit_to_qa']),

        // ── Quality Assurance ──
        ...define('qa_releases',   ['create', 'read', 'update', 'delete', 'approve', 'reject', 'notify_warehouse']),
        ...define('deviations',    ['create', 'read', 'update', 'delete', 'assign', 'investigate', 'close']),

        // ── Warehouse & Inventory ──
        ...define('inventory',     ['create', 'read', 'update', 'delete', 'move', 'adjust', 'export']),
        ...define('stock_movements',['create', 'read', 'update', 'reverse']),
        ...define('locations',     ['create', 'read', 'update', 'delete']),
        ...define('cycle_counts',  ['create', 'read', 'update', 'start', 'complete']),
        ...define('temperature_logs',['create', 'read', 'update', 'delete']),
        ...define('labels',        ['create', 'read', 'update', 'delete', 'print']),
        ...define('material_issues',['create', 'read', 'update', 'approve', 'pick', 'issue']),

        // ── Distribution ──
        ...define('sales_orders',  ['create', 'read', 'update', 'delete', 'approve', 'cancel', 'process', 'export']),
        ...define('shipments',     ['create', 'read', 'update', 'delete', 'allocate', 'pick', 'pack', 'ship', 'track', 'cancel']),
        ...define('pod',           ['create', 'read', 'update', 'complete']),

        // ── Sales / POS ──
        ...define('pos',           ['create', 'read', 'update', 'delete', 'void', 'refund', 'export']),
        ...define('accounts',      ['create', 'read', 'update', 'delete', 'export']),
        ...define('contracts',     ['create', 'read', 'update', 'delete', 'renew', 'terminate']),
        ...define('activities',    ['create', 'read', 'update', 'delete', 'complete']),

        // ── Reporting ──
        ...define('reports',       ['read', 'export', 'schedule']),
        ...define('dashboard',     ['read', 'export']),
        ...define('recall',        ['read', 'create', 'export']),
      ];

      await permissionRepo.save(permissions);
      console.log(`✅ Seeded ${permissions.length} permissions`);
    }
    const dbPermissions = await permissionRepo.find();

    // Helper: get permission IDs by pattern match
    const getPIds = (patterns: string[]) =>
      dbPermissions
        .filter(p => patterns.some(pat => p.name.startsWith(pat) || p.name === pat))
        .map(p => p.id);

    const allPIds = dbPermissions.map(p => p.id);

    // ──────────────────────────────────────────
    // 2. ROLES  (site-scoped flag added)
    // ──────────────────────────────────────────
    const roleRepo = dataSources.roles.getRepository(Role);
    if ((await roleRepo.count()) === 0) {
      const roles = [
        // ── System-wide (not site-scoped) ──
        {
          name: 'Admin',
          description: 'Full system access across all sites',
          permissionIds: allPIds,
          isSiteScoped: false,
        },
        {
          name: 'Procurement Manager',
          description: 'Manages sourcing, suppliers, purchase orders and goods receipts',
          permissionIds: getPIds([
            'suppliers.', 'purchase_orders.', 'goods_receipts.', 'supplier_invoices.', 'coa.',
            'raw_materials.', 'inventory.read', 'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: false,
        },
        {
          name: 'Production Manager',
          description: 'Oversees manufacturing and batch execution',
          permissionIds: getPIds([
            'boms.', 'work_orders.', 'batches.', 'batch_steps.', 'consumptions.', 'ebr.',
            'drugs.read', 'raw_materials.read', 'inventory.read', 'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: false,
        },
        {
          name: 'QC Manager',
          description: 'Quality Control — testing and sample management',
          permissionIds: getPIds([
            'qc_tests.', 'qc_samples.', 'qc_results.', 'coa.',
            'drugs.read', 'raw_materials.read', 'inventory.read', 'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: false,
        },
        {
          name: 'QA Manager',
          description: 'Quality Assurance — releases, deviations and compliance',
          permissionIds: getPIds([
            'qa_releases.', 'deviations.',
            'qc_results.read', 'qc_results.approve',
            'batches.read', 'ebr.', 'drugs.read', 'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: false,
        },
        {
          name: 'Warehouse Operator',
          description: 'Inventory, stock movements, cycle counts and labelling',
          permissionIds: getPIds([
            'inventory.', 'stock_movements.', 'locations.', 'cycle_counts.',
            'temperature_logs.', 'labels.', 'material_issues.',
            'shipments.read', 'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: false,
        },
        {
          name: 'Distribution Operator',
          description: 'Manages sales orders, shipments and proof of delivery',
          permissionIds: getPIds([
            'sales_orders.', 'shipments.', 'pod.',
            'accounts.read', 'inventory.read', 'inventory.move', 'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: false,
        },
        {
          name: 'Sales Representative',
          description: 'CRM — accounts, activities, contracts and sales orders',
          permissionIds: getPIds([
            'accounts.', 'activities.', 'contracts.', 'sales_orders.create', 'sales_orders.read',
            'sales_orders.update', 'drugs.read', 'inventory.read', 'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: false,
        },

        // ── Site-scoped roles ──
        {
          name: 'Site Manager',
          description: 'Manages a single site — full visibility but restricted to assigned site(s) only',
          permissionIds: getPIds([
            'users.read', 'users.update', 'users.assign_site',
            'inventory.', 'stock_movements.read', 'locations.read',
            'pos.', 'sales_orders.read', 'batches.read',
            'temperature_logs.read', 'cycle_counts.read',
            'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: true,   // ← KEY FLAG: only own-site data
        },
        {
          name: 'Cashier',
          description: 'POS operator — creates and manages sales transactions at assigned site',
          permissionIds: getPIds([
            'pos.create', 'pos.read', 'pos.update',
            'drugs.read', 'inventory.read', 'dashboard.read',
          ]),
          isSiteScoped: true,   // ← Cashiers are also site-scoped
        },
        {
          name: 'Pharmacist',
          description: 'Dispenses medication, reviews prescriptions and monitors drug inventory',
          permissionIds: getPIds([
            'drugs.read', 'drugs.update',
            'inventory.read', 'inventory.adjust',
            'pos.create', 'pos.read',
            'raw_materials.read', 'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: true,
        },
        {
          name: 'Store Supervisor',
          description: 'Supervises day-to-day store operations at assigned site',
          permissionIds: getPIds([
            'users.read',
            'inventory.read', 'inventory.update', 'inventory.move',
            'pos.', 'accounts.read',
            'temperature_logs.', 'cycle_counts.read',
            'reports.read', 'dashboard.read',
          ]),
          isSiteScoped: true,
        },
      ];

      await roleRepo.save(roles);
      console.log('✅ Seeded roles with permission associations');
    }
    const dbRoles = await roleRepo.find();

    const getRoleByName = (name: string) => dbRoles.find(r => r.name === name)!;

    // ──────────────────────────────────────────
    // 3. SITES  (five diverse sites)
    // ──────────────────────────────────────────
    const siteRepo = dataSources.sites.getRepository(Site);
    if ((await siteRepo.count()) === 0) {
      await siteRepo.save([
        { name: 'Ziauddin Pharma — Manufacturing Plant',   address: '4/B, Block 6, PECHS',              city: 'Karachi',     country: 'Pakistan', type: SiteType.MANUFACTURING },
        { name: 'North Distribution Warehouse',            address: 'Plot 10, Sector 12, Korangi',      city: 'Karachi',     country: 'Pakistan', type: SiteType.WAREHOUSE },
        { name: 'Blue Area Retail Pharmacy',               address: 'Shop 2, Plaza 5, Blue Area',       city: 'Islamabad',   country: 'Pakistan', type: SiteType.PHARMACY },
        { name: 'Lahore City Clinic & Dispensary',         address: '22-B, Gulberg III',                city: 'Lahore',      country: 'Pakistan', type: SiteType.CLINIC },
        { name: 'Peshawar Hospital Pharmacy',              address: 'Phase 4, Hayatabad',               city: 'Peshawar',    country: 'Pakistan', type: SiteType.HOSPITAL },
      ]);
      console.log('✅ Seeded 5 sites');
    }
    const dbSites = await siteRepo.find();

    const site = (name: string) => dbSites.find(s => s.name.includes(name))!;
    const siteKarachiMfg = site('Manufacturing');
    const siteKarachiWH  = site('Warehouse');
    const siteIslamabad  = site('Blue Area');
    const siteLahore     = site('Lahore');
    const sitePeshawar   = site('Peshawar');

    // ──────────────────────────────────────────
    // 4. USERS  (per-site employees + global staff)
    // ──────────────────────────────────────────
    const userRepo = dataSources.users.getRepository(User);
    if ((await userRepo.count()) === 0) {
      const pw = await hash('admin123', 10);

      const users = [
        // ── Global admin ──
        {
          name: 'System Administrator',
          email: 'admin@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Admin').id,
          siteIds: dbSites.map(s => s.id),   // access to ALL sites
          profilePicture: 'https://ui-avatars.com/api/?name=System+Admin&background=1a1a2e&color=fff',
        },

        // ── Global managers (not site-scoped) ──
        {
          name: 'Hamza Procurement',
          email: 'hamza.procurement@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Procurement Manager').id,
          siteIds: [siteKarachiMfg.id, siteKarachiWH.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Hamza+Procurement&background=random',
        },
        {
          name: 'Zara Production',
          email: 'zara.production@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Production Manager').id,
          siteIds: [siteKarachiMfg.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Zara+Production&background=random',
        },
        {
          name: 'Omar QC',
          email: 'omar.qc@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('QC Manager').id,
          siteIds: [siteKarachiMfg.id, siteKarachiWH.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Omar+QC&background=random',
        },
        {
          name: 'Sara QA',
          email: 'sara.qa@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('QA Manager').id,
          siteIds: [siteKarachiMfg.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Sara+QA&background=random',
        },
        {
          name: 'Ali Warehouse',
          email: 'ali.warehouse@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Warehouse Operator').id,
          siteIds: [siteKarachiWH.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Ali+Warehouse&background=random',
        },
        {
          name: 'Bilal Distribution',
          email: 'bilal.distribution@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Distribution Operator').id,
          siteIds: [siteKarachiWH.id, siteIslamabad.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Bilal+Distribution&background=random',
        },
        {
          name: 'Nadia Sales',
          email: 'nadia.sales@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Sales Representative').id,
          siteIds: [siteIslamabad.id, siteLahore.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Nadia+Sales&background=random',
        },

        // ── Site Managers (site-scoped — see only their site) ──
        {
          name: 'Karachi Site Manager',
          email: 'manager.karachi@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Site Manager').id,
          siteIds: [siteKarachiMfg.id],   // ← only Karachi Manufacturing
          profilePicture: 'https://ui-avatars.com/api/?name=Karachi+Manager&background=4f46e5&color=fff',
        },
        {
          name: 'Islamabad Site Manager',
          email: 'manager.islamabad@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Site Manager').id,
          siteIds: [siteIslamabad.id],   // ← only Islamabad Pharmacy
          profilePicture: 'https://ui-avatars.com/api/?name=Islamabad+Manager&background=4f46e5&color=fff',
        },
        {
          name: 'Lahore Site Manager',
          email: 'manager.lahore@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Site Manager').id,
          siteIds: [siteLahore.id],   // ← only Lahore Clinic
          profilePicture: 'https://ui-avatars.com/api/?name=Lahore+Manager&background=4f46e5&color=fff',
        },
        {
          name: 'Peshawar Site Manager',
          email: 'manager.peshawar@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Site Manager').id,
          siteIds: [sitePeshawar.id],  // ← only Peshawar Hospital
          profilePicture: 'https://ui-avatars.com/api/?name=Peshawar+Manager&background=4f46e5&color=fff',
        },

        // ── Cashiers (site-scoped) ──
        {
          name: 'Aisha Cashier — Islamabad',
          email: 'aisha.cashier@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Cashier').id,
          siteIds: [siteIslamabad.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Aisha+Cashier&background=059669&color=fff',
        },
        {
          name: 'Usman Cashier — Lahore',
          email: 'usman.cashier@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Cashier').id,
          siteIds: [siteLahore.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Usman+Cashier&background=059669&color=fff',
        },
        {
          /**
           * Example of a shifted employee:
           * Usman was originally at Islamabad but has been shifted to Lahore.
           * To shift employees between sites, simply update their siteIds via
           * PUT /users/:id  with the new siteIds array.
           * The system will then restrict/allow data access accordingly.
           */
          name: 'Fatima Cashier — Peshawar',
          email: 'fatima.cashier@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Cashier').id,
          siteIds: [sitePeshawar.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Fatima+Cashier&background=059669&color=fff',
        },

        // ── Pharmacists (site-scoped) ──
        {
          name: 'Dr. Kamran — Islamabad',
          email: 'kamran.pharmacist@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Pharmacist').id,
          siteIds: [siteIslamabad.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Dr+Kamran&background=0284c7&color=fff',
        },
        {
          name: 'Dr. Hina — Lahore',
          email: 'hina.pharmacist@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Pharmacist').id,
          siteIds: [siteLahore.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Dr+Hina&background=0284c7&color=fff',
        },

        // ── Store Supervisors (site-scoped) ──
        {
          name: 'Tariq Supervisor — Warehouse',
          email: 'tariq.supervisor@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Store Supervisor').id,
          siteIds: [siteKarachiWH.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Tariq+Supervisor&background=dc2626&color=fff',
        },
        {
          name: 'Sana Supervisor — Peshawar',
          email: 'sana.supervisor@ziauddinpharma.com',
          password: pw,
          roleId: getRoleByName('Store Supervisor').id,
          siteIds: [sitePeshawar.id],
          profilePicture: 'https://ui-avatars.com/api/?name=Sana+Supervisor&background=dc2626&color=fff',
        },
      ];

      await userRepo.save(users);
      console.log(`✅ Seeded ${users.length} users across ${dbSites.length} sites`);
    }
    const dbUsers = await userRepo.find();
    const adminUser = dbUsers.find(u => u.email === 'admin@ziauddinpharma.com')!;

    // ──────────────────────────────────────────
    // 5. MASTER DATA
    // ──────────────────────────────────────────
    const supplierRepo = dataSources.suppliers.getRepository(Supplier);
    if ((await supplierRepo.count()) === 0) {
      await supplierRepo.save([
        { name: 'Global API Corp',   contactPerson: 'John Smith',  email: 'sales@globalapi.com',    phone: '+123456789',  address: 'New York, USA',      rating: 4.5, status: SupplierStatus.ACTIVE, siteIds: [siteKarachiMfg.id] },
        { name: 'ChemSupply Ltd',    contactPerson: 'Ahmed Khan',  email: 'info@chemsupply.pk',     phone: '+9230000000', address: 'Lahore, Pakistan',   rating: 4.0, status: SupplierStatus.ACTIVE, siteIds: [siteKarachiMfg.id, siteKarachiWH.id] },
        { name: 'MedPharma Exports', contactPerson: 'Ravi Shankar',email: 'ravi@medpharma.in',      phone: '+9198765432', address: 'Mumbai, India',      rating: 3.8, status: SupplierStatus.ACTIVE, siteIds: [siteIslamabad.id] },
        { name: 'Gulf Pharmatek',    contactPerson: 'Khalid Al-Amin', email: 'k.amin@gulfpharma.ae', phone: '+97150000000', address: 'Dubai, UAE',       rating: 4.2, status: SupplierStatus.ACTIVE, siteIds: [siteLahore.id, sitePeshawar.id] },
      ]);
      console.log('✅ Seeded suppliers');
    }
    const dbSuppliers = await supplierRepo.find();

    const rmRepo = dataSources.rawMaterials.getRepository(RawMaterial);
    if ((await rmRepo.count()) === 0) {
      await rmRepo.save([
        { code: 'RM-PARA-500',   name: 'Paracetamol BP/USP',   description: 'Active Pharmaceutical Ingredient', grade: 'Pharmaceutical Grade', storageRequirements: 'Store below 30°C', unit: 'kg', supplierId: dbSuppliers[0].id, status: RawMaterialStatus.ACTIVE },
        { code: 'RM-STARCH-01',  name: 'Maize Starch',          description: 'Excipient / Disintegrant',         grade: 'USP',                   storageRequirements: 'Protect from moisture',  unit: 'kg', supplierId: dbSuppliers[1].id, status: RawMaterialStatus.ACTIVE },
        { code: 'RM-AMX-250',    name: 'Amoxicillin Trihydrate', description: 'Broad-spectrum antibiotic API',   grade: 'BP',                    storageRequirements: 'Store below 25°C',      unit: 'kg', supplierId: dbSuppliers[0].id, status: RawMaterialStatus.ACTIVE },
        { code: 'RM-MET-500',    name: 'Metformin HCl',          description: 'Antidiabetic API',                grade: 'USP',                   storageRequirements: 'Store in dry conditions',unit: 'kg', supplierId: dbSuppliers[2].id, status: RawMaterialStatus.ACTIVE },
      ]);
      console.log('✅ Seeded raw materials');
    }

    const drugRepo = dataSources.drugs.getRepository(Drug);
    if ((await drugRepo.count()) === 0) {
      await drugRepo.save([
        { code: 'DRG-PAN-500', name: 'Panadol Forte',    formula: 'Paracetamol 500mg',   strength: '500mg',  dosageForm: DosageForm.TABLET,  route: Route.ORAL, description: 'Pain & fever',           therapeuticClass: 'Analgesic',        manufacturer: 'Ziauddin Pharma', registrationNumber: 'DRAP-0123', expiryDate: new Date('2027-06-01'), storageConditions: 'Below 25°C', createdBy: adminUser.id },
        { code: 'DRG-AMX-250', name: 'Amoxil 250mg',     formula: 'Amoxicillin 250mg',   strength: '250mg',  dosageForm: DosageForm.CAPSULE, route: Route.ORAL, description: 'Antibiotic',             therapeuticClass: 'Anti-infective',   manufacturer: 'Ziauddin Pharma', registrationNumber: 'DRAP-0456', expiryDate: new Date('2026-12-01'), storageConditions: 'Cool & dry',  createdBy: adminUser.id },
        { code: 'DRG-MET-500', name: 'Glucophage 500mg', formula: 'Metformin HCl 500mg', strength: '500mg',  dosageForm: DosageForm.TABLET,  route: Route.ORAL, description: 'Type 2 diabetes',        therapeuticClass: 'Antidiabetic',     manufacturer: 'Ziauddin Pharma', registrationNumber: 'DRAP-0789', expiryDate: new Date('2027-03-01'), storageConditions: 'Below 30°C', createdBy: adminUser.id },
        { code: 'DRG-AZI-250', name: 'Zithromax 250mg',  formula: 'Azithromycin 250mg',  strength: '250mg',  dosageForm: DosageForm.CAPSULE, route: Route.ORAL, description: 'Macrolide antibiotic',   therapeuticClass: 'Anti-infective',   manufacturer: 'Ziauddin Pharma', registrationNumber: 'DRAP-1012', expiryDate: new Date('2026-09-01'), storageConditions: 'Cool & dry',  createdBy: adminUser.id },
        { code: 'DRG-ORS-PED', name: 'Pedialyte ORS',    formula: 'ORS Sachets',         strength: 'Standard', dosageForm: DosageForm.SYRUP, route: Route.ORAL, description: 'Rehydration therapy',  therapeuticClass: 'Electrolytes',     manufacturer: 'Ziauddin Pharma', registrationNumber: 'DRAP-1234', expiryDate: new Date('2027-01-01'), storageConditions: 'Room temp',  createdBy: adminUser.id },
      ]);
      console.log('✅ Seeded drugs');
    }
    const dbDrugs = await drugRepo.find();

    // ──────────────────────────────────────────
    // 6. TRANSACTIONAL DATA
    // ──────────────────────────────────────────
    const invRepo = dataSources.warehouse.getRepository(InventoryItem);
    if ((await invRepo.count()) === 0) {
      await invRepo.save([
        { itemCode: 'INV-001', materialId: dbDrugs[0].id, materialName: dbDrugs[0].name, materialCode: dbDrugs[0].code, batchNumber: 'B-PAN-001', quantity: 5000, unit: 'Tablets',  status: InventoryStatus.AVAILABLE, zone: 'A', rack: 'R1', shelf: 'S2' },
        { itemCode: 'INV-002', materialId: dbDrugs[1].id, materialName: dbDrugs[1].name, materialCode: dbDrugs[1].code, batchNumber: 'B-AMX-102', quantity: 1200, unit: 'Capsules', status: InventoryStatus.AVAILABLE, zone: 'B', rack: 'R4', shelf: 'S1' },
        { itemCode: 'INV-003', materialId: dbDrugs[2].id, materialName: dbDrugs[2].name, materialCode: dbDrugs[2].code, batchNumber: 'B-MET-301', quantity: 800,  unit: 'Tablets',  status: InventoryStatus.AVAILABLE, zone: 'C', rack: 'R2', shelf: 'S3' },
        { itemCode: 'INV-004', materialId: dbDrugs[3].id, materialName: dbDrugs[3].name, materialCode: dbDrugs[3].code, batchNumber: 'B-AZI-058', quantity: 600,  unit: 'Capsules', status: InventoryStatus.RESERVED,  zone: 'B', rack: 'R3', shelf: 'S2' },
      ]);
      console.log('✅ Seeded inventory');
    }

    const batchRepo = dataSources.manufacturing.getRepository(Batch);
    if ((await batchRepo.count()) === 0) {
      await batchRepo.save([
        { batchNumber: 'BAT-2024-XP',  drugId: dbDrugs[0].id, drugName: dbDrugs[0].name, drugCode: dbDrugs[0].code, siteId: siteKarachiMfg.id, siteName: siteKarachiMfg.name, plannedQuantity: 50000, status: BatchStatus.IN_PROGRESS, plannedStartDate: new Date(),                      plannedEndDate: new Date(Date.now() + 7 * 86400000), createdBy: adminUser.id },
        { batchNumber: 'BAT-2024-YQ',  drugId: dbDrugs[1].id, drugName: dbDrugs[1].name, drugCode: dbDrugs[1].code, siteId: siteKarachiMfg.id, siteName: siteKarachiMfg.name, plannedQuantity: 20000, status: BatchStatus.PLANNED,      plannedStartDate: new Date(Date.now() + 8 * 86400000), plannedEndDate: new Date(Date.now() + 15 * 86400000), createdBy: adminUser.id },
      ]);
      console.log('✅ Seeded batches');
    }

    const salesRepo = dataSources.sales.getRepository(POSTransaction);
    if ((await salesRepo.count()) === 0) {
      const cashier = dbUsers.find(u => u.email === 'aisha.cashier@ziauddinpharma.com')!;
      await salesRepo.save([
        {
          transactionNumber: 'TX-10001', terminalId: 'TERM-ISB-01', terminalName: 'Islamabad Counter 1',
          siteId: siteIslamabad.id, siteName: siteIslamabad.name,
          cashierId: cashier.id, cashierName: cashier.name,
          customerName: 'Walk-in Customer',
          items: [{ productId: dbDrugs[0].code, productName: dbDrugs[0].name, quantity: 2, unitPrice: 15, totalPrice: 30 }],
          subtotal: 30, tax: 2, total: 32,
          paymentMethod: PaymentMethod.CASH, paymentStatus: PaymentStatus.PAID,
          status: TransactionStatus.COMPLETED, transactionDate: new Date(), createdBy: cashier.id,
        },
        {
          transactionNumber: 'TX-10002', terminalId: 'TERM-LHR-01', terminalName: 'Lahore Counter 1',
          siteId: siteLahore.id, siteName: siteLahore.name,
          cashierId: dbUsers.find(u => u.email === 'usman.cashier@ziauddinpharma.com')!.id,
          cashierName: 'Usman Cashier — Lahore',
          customerName: 'Ahmed Raza',
          items: [{ productId: dbDrugs[2].code, productName: dbDrugs[2].name, quantity: 1, unitPrice: 45, totalPrice: 45 }],
          subtotal: 45, tax: 3, total: 48,
          paymentMethod: PaymentMethod.CARD, paymentStatus: PaymentStatus.PAID,
          status: TransactionStatus.COMPLETED, transactionDate: new Date(), createdBy: dbUsers.find(u => u.email === 'usman.cashier@ziauddinpharma.com')!.id,
        },
      ]);
      console.log('✅ Seeded POS transactions');
    }

    const shipRepo = dataSources.shipment.getRepository(Shipment);
    if ((await shipRepo.count()) === 0) {
      await shipRepo.save([
        {
          shipmentNumber: 'SHP-9001', salesOrderId: 1, salesOrderNumber: 'SO-5001', accountId: 1, accountName: 'General Hospital',
          siteId: siteKarachiWH.id, siteName: siteKarachiWH.name,
          status: ShipmentStatus.IN_TRANSIT, priority: DistributionPriority.NORMAL,
          shipmentDate: new Date(), expectedDeliveryDate: new Date(Date.now() + 2 * 86400000),
          carrier: 'PharmaExpress', serviceType: 'Standard Delivery',
          shippingAddress: { street: 'Main Blvd', city: 'Karachi', state: 'Sindh', postalCode: '75000', country: 'Pakistan', contactPerson: 'Mr. Ali', phone: '0300123', email: 'ali@hosp.com' },
          createdBy: adminUser.id, createdByName: adminUser.name,
        },
      ]);
      console.log('✅ Seeded shipments');
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`   Permissions : ${(await permissionRepo.count())}`);
    console.log(`   Roles       : ${dbRoles.length}`);
    console.log(`   Sites       : ${dbSites.length}`);
    console.log(`   Users       : ${(await userRepo.count())}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    for (const ds of Object.values(dataSources)) {
      if (ds.isInitialized) await ds.destroy();
    }
  }
}

seed();
