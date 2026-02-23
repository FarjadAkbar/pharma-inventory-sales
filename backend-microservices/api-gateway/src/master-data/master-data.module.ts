import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SitesController } from './sites.controller';
import { SuppliersController } from './suppliers.controller';
import { DrugsController } from './drugs.controller';
import { RawMaterialsController } from './raw-materials.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MASTER_DATA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MASTER_DATA_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.MASTER_DATA_SERVICE_PORT || '3002', 10),
        },
      },
    ]),
  ],
  controllers: [
    SitesController,
    SuppliersController,
    DrugsController,
    RawMaterialsController,
  ],
})
export class MasterDataModule {}
