import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

import { AppDataSource } from './data-source';
import { seedIdentity } from './seeders/identity.seeder';
import { seedMasterData } from './seeders/master-data.seeder';
import { seedProcurement } from './seeders/procurement.seeder';
import { seedWarehouse } from './seeders/warehouse.seeder';
import { seedQuality } from './seeders/quality.seeder';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected. Running seeders...');

    await seedIdentity(AppDataSource);
    await seedMasterData(AppDataSource);
    await seedProcurement(AppDataSource);
    await seedWarehouse(AppDataSource);
    await seedQuality(AppDataSource);

    console.log('Seeding completed.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

run();
