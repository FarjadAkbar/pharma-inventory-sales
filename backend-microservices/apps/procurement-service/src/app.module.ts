import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm.config';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { GoodsReceiptModule } from './goods-receipt/goods-receipt.module';
import { SupplierInvoicesModule } from './supplier-invoices/supplier-invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    PurchaseOrdersModule,
    GoodsReceiptModule,
    SupplierInvoicesModule,
  ],
})
export class AppModule {}
