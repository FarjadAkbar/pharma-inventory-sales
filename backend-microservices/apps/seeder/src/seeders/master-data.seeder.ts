import { DataSource } from 'typeorm';
import { Unit } from '../../../master-data-service/src/entities/unit.entity';
import { Category } from '../../../master-data-service/src/entities/category.entity';
import { Site } from '../../../master-data-service/src/entities/site.entity';
import { Supplier } from '../../../master-data-service/src/entities/supplier.entity';
import { Drug } from '../../../master-data-service/src/entities/drug.entity';
import { RawMaterial } from '../../../master-data-service/src/entities/raw-material.entity';
import { DosageForm, Route, ApprovalStatus, SupplierStatus, RawMaterialStatus, SiteType } from '@repo/shared';

export async function seedMasterData(ds: DataSource) {
  const unitRepo = ds.getRepository(Unit);
  const categoryRepo = ds.getRepository(Category);
  const siteRepo = ds.getRepository(Site);
  const supplierRepo = ds.getRepository(Supplier);
  const drugRepo = ds.getRepository(Drug);
  const rawMaterialRepo = ds.getRepository(RawMaterial);

  if ((await siteRepo.count()) > 0) {
    console.log('  Master data: already has data, skip.');
    return;
  }

  await unitRepo.save([
    { code: 'KG', name: 'Kilogram', symbol: 'kg' },
    { code: 'G', name: 'Gram', symbol: 'g' },
    { code: 'L', name: 'Litre', symbol: 'L' },
    { code: 'ML', name: 'Millilitre', symbol: 'ml' },
    { code: 'UNIT', name: 'Unit', symbol: 'u' },
    { code: 'BOX', name: 'Box', symbol: 'box' },
  ]);

  await categoryRepo.save([
    { code: 'API', name: 'Active Pharmaceutical Ingredient', description: 'Raw API' },
    { code: 'EXC', name: 'Excipient', description: 'Excipients' },
    { code: 'PACK', name: 'Packaging', description: 'Packaging materials' },
  ]);

  const sites = await siteRepo.save([
    { name: 'Main Warehouse', address: '100 Industrial Ave', city: 'Mumbai', country: 'India', type: SiteType.WAREHOUSE, isActive: true },
    { name: 'Plant Alpha', address: '200 Manufacturing Rd', city: 'Pune', country: 'India', type: SiteType.MANUFACTURING, isActive: true },
    { name: 'Clinic Central', address: '50 Health St', city: 'Mumbai', country: 'India', type: SiteType.CLINIC, isActive: true },
  ]);

  const suppliers = await supplierRepo.save([
    {
      name: 'Pharma Supplies Ltd',
      contactPerson: 'Raj Kumar',
      email: 'raj@pharmasupplies.com',
      phone: '+91-9876543210',
      address: '30 Supplier Lane',
      rating: 4.5,
      status: SupplierStatus.ACTIVE,
      siteIds: [sites[0].id],
    },
    {
      name: 'ChemCorp Inc',
      contactPerson: 'Priya Singh',
      email: 'priya@chemcorp.com',
      phone: '+91-9876543211',
      address: '40 Chemical Park',
      rating: 4.2,
      status: SupplierStatus.ACTIVE,
      siteIds: [sites[0].id, sites[1].id],
    },
  ]);

  const drugs = await drugRepo.save([
    {
      code: 'DRG-001',
      name: 'Paracetamol 500mg Tablets',
      dosageForm: DosageForm.TABLET,
      route: Route.ORAL,
      approvalStatus: ApprovalStatus.APPROVED,
      therapeuticClass: 'Analgesic',
      manufacturer: 'Pharma Labs',
      createdBy: 1,
    },
    {
      code: 'DRG-002',
      name: 'Amoxicillin 250mg Capsules',
      dosageForm: DosageForm.CAPSULE,
      route: Route.ORAL,
      approvalStatus: ApprovalStatus.APPROVED,
      therapeuticClass: 'Antibiotic',
      manufacturer: 'MediCorp',
      createdBy: 1,
    },
  ]);

  await rawMaterialRepo.save([
    {
      code: 'RM-001',
      name: 'Paracetamol API',
      description: 'Active ingredient',
      grade: 'Pharma',
      unit: 'kg',
      supplierId: suppliers[0].id,
      status: RawMaterialStatus.ACTIVE,
    },
    {
      code: 'RM-002',
      name: 'Lactose Monohydrate',
      description: 'Excipient',
      grade: 'Pharma',
      unit: 'kg',
      supplierId: suppliers[0].id,
      status: RawMaterialStatus.ACTIVE,
    },
    {
      code: 'RM-003',
      name: 'Amoxicillin Trihydrate',
      description: 'API',
      grade: 'Pharma',
      unit: 'kg',
      supplierId: suppliers[1].id,
      status: RawMaterialStatus.ACTIVE,
    },
  ]);

  console.log('  Master data: units, categories, sites, suppliers, drugs, raw materials seeded.');
}
