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
          host: process.env.MASTER_DATA_SERVICE_HOST,
          port: parseInt(process.env.MASTER_DATA_SERVICE_PORT || '3020'),
        },
      },
      {
        name: 'RAW_MATERIAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MASTER_DATA_SERVICE_HOST,
          port: parseInt(process.env.MASTER_DATA_SERVICE_PORT || '3020'),
        },
      },
      {
        name: 'SUPPLIER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MASTER_DATA_SERVICE_HOST,
          port: parseInt(process.env.MASTER_DATA_SERVICE_PORT || '3020'),
        },
      },
    ]),
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}

