import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sup3r_s3cr3tk3y_for_auth3ntication',
      signOptions: { expiresIn: '15m' },
    }),
    ConfigModule,
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
