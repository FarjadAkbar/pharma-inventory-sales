import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem]),
    ClientsModule.register([
      {
        name: 'SITE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SITE_SERVICE_HOST,
          port: parseInt(process.env.SITE_SERVICE_PORT),
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
        name: 'SUPPLIER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SUPPLIER_SERVICE_HOST,
          port: parseInt(process.env.SUPPLIER_SERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}

