import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { IdentityModule } from './identity/identity.module';
import { MasterDataModule } from './master-data/master-data.module';
import { QualityModule } from './quality/quality.module';
import { ProcurementModule } from './procurement/procurement.module';
import { WarehouseController } from './warehouse/warehouse.controller';
import { ManufacturingController } from './manufacturing/manufacturing.controller';
import { DistributionController } from './distribution/distribution.controller';
import { SalesCrmController } from './sales-crm/sales-crm.controller';
import { HealthController } from './health/health.controller';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().default(8000),
        JWT_SECRET: Joi.string().required(),
        IDENTITY_SERVICE_HOST: Joi.string().required(),
        IDENTITY_SERVICE_PORT: Joi.number().required(),
        MASTER_DATA_SERVICE_HOST: Joi.string().required(),
        MASTER_DATA_SERVICE_PORT: Joi.number().required(),
        QUALITY_SERVICE_HOST: Joi.string().required(),
        QUALITY_SERVICE_PORT: Joi.number().required(),
        PROCUREMENT_SERVICE_HOST: Joi.string().required(),
        PROCUREMENT_SERVICE_PORT: Joi.number().default(3011),
      }),
    }),
    TerminusModule,
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sup3r_s3cr3tk3y_for_auth3ntication',
      signOptions: { expiresIn: '15m' },
    }),
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.IDENTITY_SERVICE_HOST,
          port: parseInt(process.env.IDENTITY_SERVICE_PORT),
        },
      },
      {
        name: 'MASTER_DATA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MASTER_DATA_SERVICE_HOST,
          port: parseInt(process.env.MASTER_DATA_SERVICE_PORT),
        },
      },
      {
        name: 'PROCUREMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PROCUREMENT_SERVICE_HOST,
          port: parseInt(process.env.PROCUREMENT_SERVICE_PORT || '3011'),
        },
      },
      {
        name: 'QUALITY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_SERVICE_HOST,
          port: parseInt(process.env.QUALITY_SERVICE_PORT),
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
        name: 'SALES_ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SALES_ORDER_SERVICE_HOST,
          port: parseInt(process.env.SALES_ORDER_SERVICE_PORT),
        },
      },
      {
        name: 'SHIPMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SHIPMENT_SERVICE_HOST,
          port: parseInt(process.env.SHIPMENT_SERVICE_PORT),
        },
      },
      {
        name: 'SALES_CRM_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SALES_CRM_SERVICE_HOST,
          port: parseInt(process.env.SALES_CRM_SERVICE_PORT),
        },
      },
    ]),
    IdentityModule,
    MasterDataModule,
    QualityModule,
    ProcurementModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [
    WarehouseController,
    ManufacturingController,
    DistributionController,
    SalesCrmController,
    HealthController,
  ],
})
export class AppModule {}
