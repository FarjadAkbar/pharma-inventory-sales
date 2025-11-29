import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RawMaterialEntity } from '@/core/raw-material/entity/raw-material';
import { IRawMaterialRepository } from '@/core/raw-material/repository/raw-material';
import { RawMaterialCreateUsecase } from '@/core/raw-material/use-cases/raw-material-create';
import { RawMaterialDeleteUsecase } from '@/core/raw-material/use-cases/raw-material-delete';
import { RawMaterialGetByIdUsecase } from '@/core/raw-material/use-cases/raw-material-get-by-id';
import { RawMaterialListUsecase } from '@/core/raw-material/use-cases/raw-material-list';
import { RawMaterialUpdateUsecase } from '@/core/raw-material/use-cases/raw-material-update';
import { ISupplierRepository } from '@/core/supplier/repository/supplier';
import { RedisCacheModule } from '@/infra/cache/redis';
import { RawMaterialSchema } from '@/infra/database/postgres/schemas/raw-material';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';
import { SupplierModule } from '../supplier/module';

import {
  IRawMaterialCreateAdapter,
  IRawMaterialDeleteAdapter,
  IRawMaterialGetByIdAdapter,
  IRawMaterialListAdapter,
  IRawMaterialUpdateAdapter
} from './adapter';
import { RawMaterialController } from './controller';
import { RawMaterialRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([RawMaterialSchema]),
    SupplierModule
  ],
  controllers: [RawMaterialController],
  providers: [
    {
      provide: IRawMaterialRepository,
      useFactory: (repository: Repository<RawMaterialSchema & RawMaterialEntity>) => {
        return new RawMaterialRepository(repository);
      },
      inject: [getRepositoryToken(RawMaterialSchema)]
    },
    {
      provide: IRawMaterialCreateAdapter,
      useFactory: (
        rawMaterialRepository: IRawMaterialRepository,
        supplierRepository: ISupplierRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new RawMaterialCreateUsecase(rawMaterialRepository, supplierRepository, loggerService, event);
      },
      inject: [IRawMaterialRepository, ISupplierRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IRawMaterialUpdateAdapter,
      useFactory: (rawMaterialRepository: IRawMaterialRepository, loggerService: ILoggerAdapter) => {
        return new RawMaterialUpdateUsecase(rawMaterialRepository, loggerService);
      },
      inject: [IRawMaterialRepository, ILoggerAdapter]
    },
    {
      provide: IRawMaterialListAdapter,
      useFactory: (rawMaterialRepository: IRawMaterialRepository) => {
        return new RawMaterialListUsecase(rawMaterialRepository);
      },
      inject: [IRawMaterialRepository]
    },
    {
      provide: IRawMaterialDeleteAdapter,
      useFactory: (rawMaterialRepository: IRawMaterialRepository) => {
        return new RawMaterialDeleteUsecase(rawMaterialRepository);
      },
      inject: [IRawMaterialRepository]
    },
    {
      provide: IRawMaterialGetByIdAdapter,
      useFactory: (rawMaterialRepository: IRawMaterialRepository) => {
        return new RawMaterialGetByIdUsecase(rawMaterialRepository);
      },
      inject: [IRawMaterialRepository]
    }
  ],
  exports: [
    IRawMaterialRepository,
    IRawMaterialCreateAdapter,
    IRawMaterialUpdateAdapter,
    IRawMaterialListAdapter,
    IRawMaterialDeleteAdapter,
    IRawMaterialGetByIdAdapter
  ]
})
export class RawMaterialModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(RawMaterialController);
  }
}
