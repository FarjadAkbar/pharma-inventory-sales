import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { GoodsReceiptsService } from './goods-receipts.service';
import { GoodsReceipt } from '../entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../entities/goods-receipt-item.entity';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodsReceipt, GoodsReceiptItem]),
    PurchaseOrdersModule,
    ClientsModule.register([
      {
        name: 'QUALITY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_SERVICE_HOST,
          port: parseInt(process.env.QUALITY_SERVICE_PORT || '3030'),
        },
      },
      {
        name: 'MASTER_DATA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MASTER_DATA_SERVICE_HOST,
          port: parseInt(process.env.MASTER_DATA_SERVICE_PORT || '3020'),
        },
      },
    ]),
  ],
  controllers: [GoodsReceiptsController],
  providers: [GoodsReceiptsService],
})
export class GoodsReceiptModule {}

