import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SupplierEntity } from '@/core/supplier/entity/supplier';
import { ISupplierRepository } from '@/core/supplier/repository/supplier';
import { SupplierCreateUsecase } from '@/core/supplier/use-cases/supplier-create';
import { SupplierDeleteUsecase } from '@/core/supplier/use-cases/supplier-delete';
import { SupplierGetByIdUsecase } from '@/core/supplier/use-cases/supplier-get-by-id';
import { SupplierListUsecase } from '@/core/supplier/use-cases/supplier-list';
import { SupplierUpdateRatingUsecase } from '@/core/supplier/use-cases/supplier-update-rating';
import { SupplierUpdateUsecase } from '@/core/supplier/use-cases/supplier-update';
import { RedisCacheModule } from '@/infra/cache/redis';
import { SupplierSchema } from '@/infra/database/postgres/schemas/supplier';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';

import {
  ISupplierCreateAdapter,
  ISupplierDeleteAdapter,
  ISupplierGetByIdAdapter,
  ISupplierListAdapter,
  ISupplierUpdateAdapter,
  ISupplierUpdateRatingAdapter
} from './adapter';
import { SupplierController } from './controller';
import { SupplierRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([SupplierSchema])
  ],
  controllers: [SupplierController],
  providers: [
    {
      provide: ISupplierRepository,
      useFactory: (repository: Repository<SupplierSchema & SupplierEntity>) => {
        return new SupplierRepository(repository);
      },
      inject: [getRepositoryToken(SupplierSchema)]
    },
    {
      provide: ISupplierCreateAdapter,
      useFactory: (
        supplierRepository: ISupplierRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new SupplierCreateUsecase(supplierRepository, loggerService, event);
      },
      inject: [ISupplierRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: ISupplierUpdateAdapter,
      useFactory: (supplierRepository: ISupplierRepository, loggerService: ILoggerAdapter) => {
        return new SupplierUpdateUsecase(supplierRepository, loggerService);
      },
      inject: [ISupplierRepository, ILoggerAdapter]
    },
    {
      provide: ISupplierListAdapter,
      useFactory: (supplierRepository: ISupplierRepository) => {
        return new SupplierListUsecase(supplierRepository);
      },
      inject: [ISupplierRepository]
    },
    {
      provide: ISupplierDeleteAdapter,
      useFactory: (supplierRepository: ISupplierRepository) => {
        return new SupplierDeleteUsecase(supplierRepository);
      },
      inject: [ISupplierRepository]
    },
    {
      provide: ISupplierGetByIdAdapter,
      useFactory: (supplierRepository: ISupplierRepository) => {
        return new SupplierGetByIdUsecase(supplierRepository);
      },
      inject: [ISupplierRepository]
    },
    {
      provide: ISupplierUpdateRatingAdapter,
      useFactory: (supplierRepository: ISupplierRepository) => {
        return new SupplierUpdateRatingUsecase(supplierRepository);
      },
      inject: [ISupplierRepository]
    }
  ],
  exports: [
    ISupplierRepository,
    ISupplierCreateAdapter,
    ISupplierUpdateAdapter,
    ISupplierListAdapter,
    ISupplierDeleteAdapter,
    ISupplierGetByIdAdapter,
    ISupplierUpdateRatingAdapter
  ]
})
export class SupplierModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(SupplierController);
  }
}
