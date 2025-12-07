import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { GoodsReceiptEntity } from '@pharma/core/goods-receipt/entity/goods-receipt';
import { IGoodsReceiptRepository } from '@pharma/core/goods-receipt/repository/goods-receipt';
import { GoodsReceiptCreateUsecase } from '@pharma/core/goods-receipt/use-cases/goods-receipt-create';
import { GoodsReceiptDeleteUsecase } from '@pharma/core/goods-receipt/use-cases/goods-receipt-delete';
import { GoodsReceiptGetByIdUsecase } from '@pharma/core/goods-receipt/use-cases/goods-receipt-get-by-id';
import { GoodsReceiptListUsecase } from '@pharma/core/goods-receipt/use-cases/goods-receipt-list';
import { GoodsReceiptVerifyUsecase } from '@pharma/core/goods-receipt/use-cases/goods-receipt-verify';
import { IPurchaseOrderRepository } from '@pharma/core/purchase-order/repository/purchase-order';
import { GoodsReceiptSchema, GoodsReceiptItemSchema } from '@pharma/infra/database/postgres/schemas/goods-receipt';
import { PurchaseOrderSchema, PurchaseOrderItemSchema } from '@pharma/infra/database/postgres/schemas/purchase-order';
import { InfraModule } from '@pharma/infra/module';
import { RedisCacheModule } from '@pharma/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { SecretsModule } from '@pharma/infra/secrets';
import { EventLibModule, IEventAdapter } from '@pharma/libs/event';
import { LibModule } from '@pharma/libs/module';
import { PurchaseOrderEntity } from '@pharma/core/purchase-order/entity/purchase-order';

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
