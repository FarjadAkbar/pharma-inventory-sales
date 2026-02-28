import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { SupplierInvoicesController } from './supplier-invoices.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PROCUREMENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PROCUREMENT_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PROCUREMENT_SERVICE_PORT || '3004'),
        },
      },
    ]),
  ],
  controllers: [
    PurchaseOrdersController,
    GoodsReceiptsController,
    SupplierInvoicesController,
  ],
})
export class ProcurementModule {}
