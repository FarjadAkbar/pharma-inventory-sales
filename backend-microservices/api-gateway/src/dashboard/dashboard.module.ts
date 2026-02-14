import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.WAREHOUSE_SERVICE_PORT || '3012'),
        },
      },
      {
        name: 'DRUGS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DRUGS_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.DRUGS_SERVICE_PORT || '3014'),
        },
      },
      {
        name: 'SALES_ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SALES_ORDER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.SALES_ORDER_SERVICE_PORT || '3015'),
        },
      },
      {
        name: 'MANUFACTURING_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MANUFACTURING_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.MANUFACTURING_SERVICE_PORT || '3013'),
        },
      },
      {
        name: 'QUALITY_CONTROL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_CONTROL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.QUALITY_CONTROL_SERVICE_PORT || '3010'),
        },
      },
      {
        name: 'QUALITY_ASSURANCE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_ASSURANCE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.QUALITY_ASSURANCE_SERVICE_PORT || '3011'),
        },
      },
      {
        name: 'SHIPMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SHIPMENT_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.SHIPMENT_SERVICE_PORT || '3016'),
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT || '3004'),
        },
      },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
