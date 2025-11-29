import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { RedisCacheModule } from '@/infra/cache/redis';
import { GoodsReceiptSchema, GoodsReceiptItemSchema } from '@/infra/database/postgres/schemas/goods-receipt';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';
import { PurchaseOrderModule } from '../purchase-order/module';

import {
  IGoodsReceiptCreateAdapter,
  IGoodsReceiptDeleteAdapter,
  IGoodsReceiptGetByIdAdapter,
  IGoodsReceiptListAdapter,
  IGoodsReceiptVerifyAdapter
} from './adapter';
import { GoodsReceiptController } from './controller';
import { GoodsReceiptRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([GoodsReceiptSchema, GoodsReceiptItemSchema]),
    PurchaseOrderModule
  ],
  controllers: [GoodsReceiptController],
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
  ],
  exports: [
    IGoodsReceiptRepository,
    IGoodsReceiptCreateAdapter,
    IGoodsReceiptGetByIdAdapter,
    IGoodsReceiptListAdapter,
    IGoodsReceiptVerifyAdapter,
    IGoodsReceiptDeleteAdapter
  ]
})
export class GoodsReceiptModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(GoodsReceiptController);
  }
}
