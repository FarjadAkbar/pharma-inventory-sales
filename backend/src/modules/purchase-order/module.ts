import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PurchaseOrderEntity } from '@/core/purchase-order/entity/purchase-order';
import { IPurchaseOrderRepository } from '@/core/purchase-order/repository/purchase-order';
import { PurchaseOrderCreateUsecase } from '@/core/purchase-order/use-cases/purchase-order-create';
import { PurchaseOrderDeleteUsecase } from '@/core/purchase-order/use-cases/purchase-order-delete';
import { PurchaseOrderGetByIdUsecase } from '@/core/purchase-order/use-cases/purchase-order-get-by-id';
import { PurchaseOrderListUsecase } from '@/core/purchase-order/use-cases/purchase-order-list';
import { PurchaseOrderApproveUsecase } from '@/core/purchase-order/use-cases/purchase-order-approve';
import { PurchaseOrderCancelUsecase } from '@/core/purchase-order/use-cases/purchase-order-cancel';
import { ISupplierRepository } from '@/core/supplier/repository/supplier';
import { IRawMaterialRepository } from '@/core/raw-material/repository/raw-material';
import { RedisCacheModule } from '@/infra/cache/redis';
import { PurchaseOrderSchema, PurchaseOrderItemSchema } from '@/infra/database/postgres/schemas/purchase-order';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';
import { SupplierModule } from '../supplier/module';
import { RawMaterialModule } from '../raw-material/module';

import {
  IPurchaseOrderCreateAdapter,
  IPurchaseOrderDeleteAdapter,
  IPurchaseOrderGetByIdAdapter,
  IPurchaseOrderListAdapter,
  IPurchaseOrderApproveAdapter,
  IPurchaseOrderCancelAdapter
} from './adapter';
import { PurchaseOrderController } from './controller';
import { PurchaseOrderRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([PurchaseOrderSchema, PurchaseOrderItemSchema]),
    SupplierModule,
    RawMaterialModule
  ],
  controllers: [PurchaseOrderController],
  providers: [
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
      provide: IPurchaseOrderCreateAdapter,
      useFactory: (
        purchaseOrderRepository: IPurchaseOrderRepository,
        supplierRepository: ISupplierRepository,
        rawMaterialRepository: IRawMaterialRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new PurchaseOrderCreateUsecase(
          purchaseOrderRepository,
          supplierRepository,
          rawMaterialRepository,
          loggerService,
          event
        );
      },
      inject: [IPurchaseOrderRepository, ISupplierRepository, IRawMaterialRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IPurchaseOrderGetByIdAdapter,
      useFactory: (purchaseOrderRepository: IPurchaseOrderRepository) => {
        return new PurchaseOrderGetByIdUsecase(purchaseOrderRepository);
      },
      inject: [IPurchaseOrderRepository]
    },
    {
      provide: IPurchaseOrderListAdapter,
      useFactory: (purchaseOrderRepository: IPurchaseOrderRepository) => {
        return new PurchaseOrderListUsecase(purchaseOrderRepository);
      },
      inject: [IPurchaseOrderRepository]
    },
    {
      provide: IPurchaseOrderApproveAdapter,
      useFactory: (purchaseOrderRepository: IPurchaseOrderRepository, loggerService: ILoggerAdapter) => {
        return new PurchaseOrderApproveUsecase(purchaseOrderRepository, loggerService);
      },
      inject: [IPurchaseOrderRepository, ILoggerAdapter]
    },
    {
      provide: IPurchaseOrderCancelAdapter,
      useFactory: (purchaseOrderRepository: IPurchaseOrderRepository, loggerService: ILoggerAdapter) => {
        return new PurchaseOrderCancelUsecase(purchaseOrderRepository, loggerService);
      },
      inject: [IPurchaseOrderRepository, ILoggerAdapter]
    },
    {
      provide: IPurchaseOrderDeleteAdapter,
      useFactory: (purchaseOrderRepository: IPurchaseOrderRepository) => {
        return new PurchaseOrderDeleteUsecase(purchaseOrderRepository);
      },
      inject: [IPurchaseOrderRepository]
    }
  ],
  exports: [
    IPurchaseOrderRepository,
    IPurchaseOrderCreateAdapter,
    IPurchaseOrderGetByIdAdapter,
    IPurchaseOrderListAdapter,
    IPurchaseOrderApproveAdapter,
    IPurchaseOrderCancelAdapter,
    IPurchaseOrderDeleteAdapter
  ]
})
export class PurchaseOrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(PurchaseOrderController);
  }
}
