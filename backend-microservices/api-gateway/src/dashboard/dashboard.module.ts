import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

/**
 * Dashboard module: exposes aggregated dashboard data for the UI.
 * DashboardService (BFF) runs in the gateway and calls identity, master-data,
 * quality, warehouse, manufacturing, sales, shipment microservices.
 * ConfigModule and JwtModule are imported so the global JwtAuthGuard can resolve its dependencies when guarding dashboard routes.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sup3r_s3cr3tk3y_for_auth3ntication',
      signOptions: { expiresIn: '15m' },
    }),
    ClientsModule.register([
      { name: 'WAREHOUSE_SERVICE', transport: Transport.TCP, options: { host: process.env.WAREHOUSE_SERVICE_HOST, port: parseInt(process.env.WAREHOUSE_SERVICE_PORT || '3022') } },
      { name: 'MASTER_DATA_SERVICE', transport: Transport.TCP, options: { host: process.env.MASTER_DATA_SERVICE_HOST, port: parseInt(process.env.MASTER_DATA_SERVICE_PORT || '3020') } },
      { name: 'SALES_ORDER_SERVICE', transport: Transport.TCP, options: { host: process.env.SALES_ORDER_SERVICE_HOST, port: parseInt(process.env.SALES_ORDER_SERVICE_PORT || '3032') } },
      { name: 'MANUFACTURING_SERVICE', transport: Transport.TCP, options: { host: process.env.MANUFACTURING_SERVICE_HOST, port: parseInt(process.env.MANUFACTURING_SERVICE_PORT || '3024') } },
      { name: 'QUALITY_SERVICE', transport: Transport.TCP, options: { host: process.env.QUALITY_SERVICE_HOST, port: parseInt(process.env.QUALITY_SERVICE_PORT || '3030') } },
      { name: 'SHIPMENT_SERVICE', transport: Transport.TCP, options: { host: process.env.SHIPMENT_SERVICE_HOST, port: parseInt(process.env.SHIPMENT_SERVICE_PORT || '3034') } },
      { name: 'IDENTITY_SERVICE', transport: Transport.TCP, options: { host: process.env.IDENTITY_SERVICE_HOST, port: parseInt(process.env.IDENTITY_SERVICE_PORT || '3001') } },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
