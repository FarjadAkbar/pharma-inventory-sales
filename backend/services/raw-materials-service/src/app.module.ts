import { Module } from '@nestjs/common';
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
import { RawMaterialSchema } from '@/infra/database/postgres/schemas/raw-material';
import { SupplierSchema } from '@/infra/database/postgres/schemas/supplier';
import { InfraModule } from '@/infra/module';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { LibModule } from '@/libs/module';
import { SupplierEntity } from '@/core/supplier/entity/supplier';

import { RawMaterialsController } from './raw-materials.controller';
import {
  IRawMaterialCreateAdapter,
  IRawMaterialDeleteAdapter,
  IRawMaterialGetByIdAdapter,
  IRawMaterialListAdapter,
  IRawMaterialUpdateAdapter
} from './adapters';
import { RawMaterialRepository } from './repositories/raw-material.repository';
import { SupplierRepository } from './repositories/supplier.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([RawMaterialSchema, SupplierSchema])
  ],
  controllers: [RawMaterialsController],
  providers: [
    {
      provide: IRawMaterialRepository,
      useFactory: (repository: Repository<RawMaterialSchema & RawMaterialEntity>) => {
        return new RawMaterialRepository(repository);
      },
      inject: [getRepositoryToken(RawMaterialSchema)]
    },
    {
      provide: ISupplierRepository,
      useFactory: (repository: Repository<SupplierSchema & SupplierEntity>) => {
        return new SupplierRepository(repository);
      },
      inject: [getRepositoryToken(SupplierSchema)]
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
  ]
})
export class AppModule {}
