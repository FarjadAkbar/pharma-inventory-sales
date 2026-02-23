import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm.config';
import { SitesModule } from './sites/sites.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DrugsModule } from './drugs/drugs.module';
import { RawMaterialsModule } from './raw-materials/raw-materials.module';
import { UnitsModule } from './units/units.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    SitesModule,
    SuppliersModule,
    DrugsModule,
    RawMaterialsModule,
    UnitsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
