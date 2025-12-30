import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { UsersController } from './users/users.controller';
import { AuthController } from './auth/auth.controller';
import { RolesController } from './roles/roles.controller';
import { PermissionsController } from './permissions/permissions.controller';
import { SitesController } from './sites/sites.controller';
import { SuppliersController } from './suppliers/suppliers.controller';
import { RawMaterialsController } from './raw-materials/raw-materials.controller';
import { PurchaseOrdersController } from './purchase-orders/purchase-orders.controller';
import { GoodsReceiptsController } from './goods-receipts/goods-receipts.controller';
import { QCSamplesController } from './qc-samples/qc-samples.controller';
import { QCTestsController } from './qc-tests/qc-tests.controller';
import { QCResultsController } from './qc-results/qc-results.controller';
import { QAReleasesController } from './qa-releases/qa-releases.controller';
import { QADeviationsController } from './qa-deviations/qa-deviations.controller';
import { WarehouseController } from './warehouse/warehouse.controller';
import { ManufacturingController } from './manufacturing/manufacturing.controller';
import { DrugsController } from './drugs/drugs.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST,
          port: parseInt(process.env.USER_SERVICE_PORT),
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST,
          port: parseInt(process.env.AUTH_SERVICE_PORT),
        },
      },
      {
        name: 'ROLE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ROLE_SERVICE_HOST,
          port: parseInt(process.env.ROLE_SERVICE_PORT),
        },
      },
      {
        name: 'PERMISSION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PERMISSION_SERVICE_HOST,
          port: parseInt(process.env.PERMISSION_SERVICE_PORT),
        },
      },
      {
        name: 'SITE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SITE_SERVICE_HOST,
          port: parseInt(process.env.SITE_SERVICE_PORT),
        },
      },
      {
        name: 'SUPPLIER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SUPPLIER_SERVICE_HOST,
          port: parseInt(process.env.SUPPLIER_SERVICE_PORT),
        },
      },
      {
        name: 'RAW_MATERIAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.RAW_MATERIAL_SERVICE_HOST,
          port: parseInt(process.env.RAW_MATERIAL_SERVICE_PORT),
        },
      },
      {
        name: 'PURCHASE_ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PURCHASE_ORDER_SERVICE_HOST,
          port: parseInt(process.env.PURCHASE_ORDER_SERVICE_PORT),
        },
      },
      {
        name: 'GOODS_RECEIPT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GOODS_RECEIPT_SERVICE_HOST,
          port: parseInt(process.env.GOODS_RECEIPT_SERVICE_PORT),
        },
      },
      {
        name: 'QUALITY_CONTROL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_CONTROL_SERVICE_HOST,
          port: parseInt(process.env.QUALITY_CONTROL_SERVICE_PORT),
        },
      },
      {
        name: 'QUALITY_ASSURANCE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_ASSURANCE_SERVICE_HOST,
          port: parseInt(process.env.QUALITY_ASSURANCE_SERVICE_PORT),
        },
      },
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST,
          port: parseInt(process.env.WAREHOUSE_SERVICE_PORT),
        },
      },
      {
        name: 'MANUFACTURING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MANUFACTURING_SERVICE_HOST,
          port: parseInt(process.env.MANUFACTURING_SERVICE_PORT),
        },
      },
      {
        name: 'DRUGS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DRUGS_SERVICE_HOST,
          port: parseInt(process.env.DRUGS_SERVICE_PORT),
        },
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [
    UsersController,
    AuthController,
    RolesController,
    PermissionsController,
    SitesController,
    SuppliersController,
    RawMaterialsController,
    PurchaseOrdersController,
    GoodsReceiptsController,
    QCSamplesController,
    QCTestsController,
    QCResultsController,
    QAReleasesController,
    QADeviationsController,
    WarehouseController,
    ManufacturingController,
    DrugsController,
  ],
})
export class AppModule {}
