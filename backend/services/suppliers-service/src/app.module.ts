import { Module } from '@nestjs/common';
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
import { SupplierSchema } from '@/infra/database/postgres/schemas/supplier';
import { InfraModule } from '@/infra/module';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { LibModule } from '@/libs/module';

import { SuppliersController } from './suppliers.controller';
import {
  ISupplierCreateAdapter,
  ISupplierDeleteAdapter,
  ISupplierGetByIdAdapter,
  ISupplierListAdapter,
  ISupplierUpdateAdapter,
  ISupplierUpdateRatingAdapter
} from './adapters';
import { SupplierRepository } from './repositories/supplier.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([SupplierSchema])
  ],
  controllers: [SuppliersController],
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
      useFactory: (supplierRepository: ISupplierRepository, loggerService: ILoggerAdapter, event: IEventAdapter) => {
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
  ]
})
export class AppModule {}
