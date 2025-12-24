import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { GoodsReceiptsService } from './goods-receipts.service';
import { GoodsReceipt } from '../entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../entities/goods-receipt-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodsReceipt, GoodsReceiptItem]),
    ClientsModule.register([
      {
        name: 'PURCHASE_ORDER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PURCHASE_ORDER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PURCHASE_ORDER_SERVICE_PORT || '3008'),
        },
      },
      {
        name: 'QC_SAMPLE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QC_SAMPLE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.QC_SAMPLE_SERVICE_PORT || '3011'),
        },
      },
      {
        name: 'RAW_MATERIAL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.RAW_MATERIAL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.RAW_MATERIAL_SERVICE_PORT || '3008'),
        },
      },
    ]),
  ],
  controllers: [GoodsReceiptsController],
  providers: [GoodsReceiptsService],
})
export class GoodsReceiptsModule {}

