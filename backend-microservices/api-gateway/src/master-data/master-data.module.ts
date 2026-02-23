import { Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SuppliersController } from './suppliers.controller';
import { DrugsController } from './drugs.controller';
import { RawMaterialsController } from './raw-materials.controller';

@Module({
  controllers: [
    SitesController,
    SuppliersController,
    DrugsController,
    RawMaterialsController,
  ],
})
export class MasterDataModule {}
