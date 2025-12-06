import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { GoodsReceiptEntity } from '@/core/goods-receipt/entity/goods-receipt';
import { IGoodsReceiptRepository } from '@/core/goods-receipt/repository/goods-receipt';
import { GoodsReceiptCreateUsecase } from '@/core/goods-receipt/use-cases/goods-receipt-create';
import { GoodsReceiptDeleteUsecase } from '@/core/goods-receipt/use-cases/goods-receipt-delete';
import { GoodsReceiptGetByIdUsecase } from '@/core/goods-receipt/use-cases/goods-receipt-get-by-id';
import { GoodsReceiptListUsecase } from '@/core/goods-receipt/use-cases/goods-receipt-list';
import { GoodsReceiptVerifyUsecase } from '@/core/goods-receipt/use-cases/goods-receipt-verify';
import { IPurchaseOrderRepository } from '@/core/purchase-order/repository/purchase-order';
import { GoodsReceiptSchema, GoodsReceiptItemSchema } from '@/infra/database/postgres/schemas/goods-receipt';
import { PurchaseOrderSchema, PurchaseOrderItemSchema } from '@/infra/database/postgres/schemas/purchase-order';
import { InfraModule } from '@/infra/module';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { LibModule } from '@/libs/module';
import { PurchaseOrderEntity } from '@/core/purchase-order/entity/purchase-order';

import { GoodsReceiptsController } from './goods-receipts.controller';
import {
  IGoodsReceiptCreateAdapter,
  IGoodsReceiptDeleteAdapter,
  IGoodsReceiptGetByIdAdapter,
  IGoodsReceiptListAdapter,
  IGoodsReceiptVerifyAdapter
} from './adapters';
import { GoodsReceiptRepository } from './repositories/goods-receipt.repository';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([GoodsReceiptSchema, GoodsReceiptItemSchema, PurchaseOrderSchema, PurchaseOrderItemSchema])
  ],
  controllers: [GoodsReceiptsController],
  providers: [
    {
      provide: IGoodsReceiptRepository,
      useFactory: (
        repository: Repository<GoodsReceiptSchema & GoodsReceiptEntity>,
        dataSource: DataSource,
        itemRepository: Repository<GoodsReceiptItemSchema>
      ) => {
        return new GoodsReceiptRepository(repository, dataSource, itemRepository);
      },
      inject: [getRepositoryToken(GoodsReceiptSchema), DataSource, getRepositoryToken(GoodsReceiptItemSchema)]
    },
    {
      provide: IPurchaseOrderRepository,
      useFactory: (
        repository: Repository<PurchaseOrderSchema & PurchaseOrderEntity>,
        dataSource: DataSource,
        itemRepository: Repository<PurchaseOrderItemSchema>
      ) => {
        return new PurchaseOrderRepository(repository, dataSource, itemRepository);
      },
      inject: [getRepositoryToken(PurchaseOrderSchema), DataSource, getRepositoryToken(PurchaseOrderItemSchema)]
    },
    {
      provide: IGoodsReceiptCreateAdapter,
      useFactory: (
        goodsReceiptRepository: IGoodsReceiptRepository,
        purchaseOrderRepository: IPurchaseOrderRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new GoodsReceiptCreateUsecase(
          goodsReceiptRepository,
          purchaseOrderRepository,
          loggerService,
          event
        );
      },
      inject: [IGoodsReceiptRepository, IPurchaseOrderRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IGoodsReceiptGetByIdAdapter,
      useFactory: (goodsReceiptRepository: IGoodsReceiptRepository) => {
        return new GoodsReceiptGetByIdUsecase(goodsReceiptRepository);
      },
      inject: [IGoodsReceiptRepository]
    },
    {
      provide: IGoodsReceiptListAdapter,
      useFactory: (goodsReceiptRepository: IGoodsReceiptRepository) => {
        return new GoodsReceiptListUsecase(goodsReceiptRepository);
      },
      inject: [IGoodsReceiptRepository]
    },
    {
      provide: IGoodsReceiptVerifyAdapter,
      useFactory: (
        goodsReceiptRepository: IGoodsReceiptRepository,
        purchaseOrderRepository: IPurchaseOrderRepository,
        loggerService: ILoggerAdapter
      ) => {
        return new GoodsReceiptVerifyUsecase(goodsReceiptRepository, purchaseOrderRepository, loggerService);
      },
      inject: [IGoodsReceiptRepository, IPurchaseOrderRepository, ILoggerAdapter]
    },
    {
      provide: IGoodsReceiptDeleteAdapter,
      useFactory: (goodsReceiptRepository: IGoodsReceiptRepository) => {
        return new GoodsReceiptDeleteUsecase(goodsReceiptRepository);
      },
      inject: [IGoodsReceiptRepository]
    }
  ]
})
export class AppModule {}
