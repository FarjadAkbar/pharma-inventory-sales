import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PurchaseOrderEntity } from '@pharma/core/purchase-order/entity/purchase-order';
import { IPurchaseOrderRepository } from '@pharma/core/purchase-order/repository/purchase-order';
import { PurchaseOrderCreateUsecase } from '@pharma/core/purchase-order/use-cases/purchase-order-create';
import { PurchaseOrderDeleteUsecase } from '@pharma/core/purchase-order/use-cases/purchase-order-delete';
import { PurchaseOrderGetByIdUsecase } from '@pharma/core/purchase-order/use-cases/purchase-order-get-by-id';
import { PurchaseOrderListUsecase } from '@pharma/core/purchase-order/use-cases/purchase-order-list';
import { PurchaseOrderApproveUsecase } from '@pharma/core/purchase-order/use-cases/purchase-order-approve';
import { PurchaseOrderCancelUsecase } from '@pharma/core/purchase-order/use-cases/purchase-order-cancel';
import { ISupplierRepository } from '@pharma/core/supplier/repository/supplier';
import { IRawMaterialRepository } from '@pharma/core/raw-material/repository/raw-material';
import { PurchaseOrderSchema, PurchaseOrderItemSchema } from '@pharma/infra/database/postgres/schemas/purchase-order';
import { SupplierSchema } from '@pharma/infra/database/postgres/schemas/supplier';
import { RawMaterialSchema } from '@pharma/infra/database/postgres/schemas/raw-material';
import { InfraModule } from '@pharma/infra/module';
import { RedisCacheModule } from '@pharma/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { SecretsModule } from '@pharma/infra/secrets';
import { EventLibModule, IEventAdapter } from '@pharma/libs/event';
import { LibModule } from '@pharma/libs/module';
import { SupplierEntity } from '@pharma/core/supplier/entity/supplier';
import { RawMaterialEntity } from '@pharma/core/raw-material/entity/raw-material';

import { PurchaseOrdersController } from './purchase-orders.controller';
import {
  IPurchaseOrderCreateAdapter,
  IPurchaseOrderDeleteAdapter,
  IPurchaseOrderGetByIdAdapter,
  IPurchaseOrderListAdapter,
  IPurchaseOrderApproveAdapter,
  IPurchaseOrderCancelAdapter
} from './adapters';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';
import { SupplierRepository } from './repositories/supplier.repository';
import { RawMaterialRepository } from './repositories/raw-material.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([PurchaseOrderSchema, PurchaseOrderItemSchema, SupplierSchema, RawMaterialSchema])
  ],
  controllers: [PurchaseOrdersController],
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
      provide: ISupplierRepository,
      useFactory: (repository: Repository<SupplierSchema & SupplierEntity>) => {
        return new SupplierRepository(repository);
      },
      inject: [getRepositoryToken(SupplierSchema)]
    },
    {
      provide: IRawMaterialRepository,
      useFactory: (repository: Repository<RawMaterialSchema & RawMaterialEntity>) => {
        return new RawMaterialRepository(repository);
      },
      inject: [getRepositoryToken(RawMaterialSchema)]
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
  ]
})
export class AppModule {}
