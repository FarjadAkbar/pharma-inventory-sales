import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { Shipment, ShipmentItem, ProofOfDelivery } from '../entities';

@Module({
  imports: [
  TypeOrmModule.forFeature([Shipment, ShipmentItem, ProofOfDelivery]),
    ClientsModule.register([
      {
        name: 'SALES_ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SALES_ORDER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.SALES_ORDER_SERVICE_PORT || '3007'),
        },
      },
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.WAREHOUSE_SERVICE_PORT || '3005'),
        },
      },
    ]),
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}

