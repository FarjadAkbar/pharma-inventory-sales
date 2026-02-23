import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { SupplierInvoicesController } from './supplier-invoices.controller';

@Module({
  controllers: [
    PurchaseOrdersController,
    GoodsReceiptsController,
    SupplierInvoicesController,
  ],
})
export class ProcurementModule {}
