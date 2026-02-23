import { DataSource } from 'typeorm';
import { Warehouse } from '../../../warehouse-service/src/entities/warehouse.entity';
import { StorageLocation } from '../../../warehouse-service/src/entities/storage-location.entity';
import { WarehouseType, WarehouseStatus } from '../../../warehouse-service/src/entities/warehouse.entity';
import { LocationType, LocationStatus } from '../../../warehouse-service/src/entities/storage-location.entity';

export async function seedWarehouse(ds: DataSource) {
  const whRepo = ds.getRepository(Warehouse);
  const locRepo = ds.getRepository(StorageLocation);

  if ((await whRepo.count()) > 0) {
    console.log('  Warehouse: already has data, skip.');
    return;
  }

  const wh = await whRepo.save({
    code: 'WH-MAIN-01',
    name: 'Main Warehouse',
    description: 'Primary storage',
    type: WarehouseType.MAIN,
    status: WarehouseStatus.ACTIVE,
    siteId: 1,
    address: '100 Industrial Ave',
    city: 'Mumbai',
    country: 'India',
  });

  await locRepo.save([
    {
      locationCode: 'A-01-01',
      warehouseId: wh.id,
      name: 'Aisle A Rack 1',
      type: LocationType.RACK,
      status: LocationStatus.AVAILABLE,
      zone: 'A',
      aisle: '01',
      rack: '01',
      capacity: 1000,
      capacityUnit: 'kg',
      requiresTemperatureControl: false,
      requiresHumidityControl: false,
    },
    {
      locationCode: 'A-01-02',
      warehouseId: wh.id,
      name: 'Aisle A Rack 2',
      type: LocationType.RACK,
      status: LocationStatus.AVAILABLE,
      zone: 'A',
      aisle: '01',
      rack: '02',
      capacity: 1000,
      capacityUnit: 'kg',
      requiresTemperatureControl: false,
      requiresHumidityControl: false,
    },
  ]);

  console.log('  Warehouse: warehouses, storage locations seeded.');
}
