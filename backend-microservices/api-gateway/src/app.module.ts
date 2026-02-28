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
import { ManufacturingModule } from './manufacturing/manufacturing.module';
import { WarehouseController } from './warehouse/warehouse.controller';
import { DistributionController } from './distribution/distribution.controller';
import { SalesCrmController } from './sales-crm/sales-crm.controller';
import { HealthController } from './health/health.controller';
import { DashboardModule } from './dashboard/dashboard.module';

const parseIntSafe = (v: string | undefined, fallback: number): number => {
  if (v === undefined || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

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
      global: true,
    }),
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.IDENTITY_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.IDENTITY_SERVICE_PORT, 3001),
        },
      },
      {
        name: 'MASTER_DATA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MASTER_DATA_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.MASTER_DATA_SERVICE_PORT, 3002),
        },
      },
      {
        name: 'PROCUREMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PROCUREMENT_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.PROCUREMENT_SERVICE_PORT, 3004),
        },
      },
      {
        name: 'QUALITY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.QUALITY_SERVICE_PORT, 3003),
        },
      },
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.WAREHOUSE_SERVICE_PORT, 3005),
        },
      },
      {
        name: 'MANUFACTURING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MANUFACTURING_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.MANUFACTURING_SERVICE_PORT, 3006),
        },
      },
      {
        name: 'SALES_ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SALES_ORDER_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.SALES_ORDER_SERVICE_PORT, 3007),
        },
      },
      {
        name: 'SHIPMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SHIPMENT_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.SHIPMENT_SERVICE_PORT, 3008),
        },
      },
      {
        name: 'SALES_CRM_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SALES_CRM_SERVICE_HOST || 'localhost',
          port: parseIntSafe(process.env.SALES_CRM_SERVICE_PORT, 3009),
        },
      },
    ]),
    IdentityModule,
    MasterDataModule,
    QualityModule,
    ProcurementModule,
    ManufacturingModule,
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
    DistributionController,
    SalesCrmController,
    HealthController,
  ],
})
export class AppModule {}
