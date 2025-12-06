import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DrugEntity } from '@/core/drug/entity/drug';
import { IDrugRepository } from '@/core/drug/repository/drug';
import { DrugCreateUsecase } from '@/core/drug/use-cases/drug-create';
import { DrugDeleteUsecase } from '@/core/drug/use-cases/drug-delete';
import { DrugGetByIdUsecase } from '@/core/drug/use-cases/drug-get-by-id';
import { DrugListUsecase } from '@/core/drug/use-cases/drug-list';
import { DrugUpdateUsecase } from '@/core/drug/use-cases/drug-update';
import { DrugApproveUsecase } from '@/core/drug/use-cases/drug-approve';
import { DrugRejectUsecase } from '@/core/drug/use-cases/drug-reject';
import { DrugSchema } from '@/infra/database/postgres/schemas/drug';
import { InfraModule } from '@/infra/module';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { LibModule } from '@/libs/module';

import { DrugsController } from './drugs.controller';
import {
  IDrugCreateAdapter,
  IDrugDeleteAdapter,
  IDrugGetByIdAdapter,
  IDrugListAdapter,
  IDrugUpdateAdapter,
  IDrugApproveAdapter,
  IDrugRejectAdapter
} from './adapters';
import { DrugRepository } from './repositories/drug.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([DrugSchema])
  ],
  controllers: [DrugsController],
  providers: [
    {
      provide: IDrugRepository,
      useFactory: (repository: Repository<DrugSchema & DrugEntity>) => {
        return new DrugRepository(repository);
      },
      inject: [getRepositoryToken(DrugSchema)]
    },
    {
      provide: IDrugCreateAdapter,
      useFactory: (drugRepository: IDrugRepository, loggerService: ILoggerAdapter, event: IEventAdapter) => {
        return new DrugCreateUsecase(drugRepository, loggerService, event);
      },
      inject: [IDrugRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IDrugUpdateAdapter,
      useFactory: (drugRepository: IDrugRepository, loggerService: ILoggerAdapter) => {
        return new DrugUpdateUsecase(drugRepository, loggerService);
      },
      inject: [IDrugRepository, ILoggerAdapter]
    },
    {
      provide: IDrugListAdapter,
      useFactory: (drugRepository: IDrugRepository) => {
        return new DrugListUsecase(drugRepository);
      },
      inject: [IDrugRepository]
    },
    {
      provide: IDrugDeleteAdapter,
      useFactory: (drugRepository: IDrugRepository) => {
        return new DrugDeleteUsecase(drugRepository);
      },
      inject: [IDrugRepository]
    },
    {
      provide: IDrugGetByIdAdapter,
      useFactory: (drugRepository: IDrugRepository) => {
        return new DrugGetByIdUsecase(drugRepository);
      },
      inject: [IDrugRepository]
    },
    {
      provide: IDrugApproveAdapter,
      useFactory: (drugRepository: IDrugRepository, loggerService: ILoggerAdapter) => {
        return new DrugApproveUsecase(drugRepository, loggerService);
      },
      inject: [IDrugRepository, ILoggerAdapter]
    },
    {
      provide: IDrugRejectAdapter,
      useFactory: (drugRepository: IDrugRepository, loggerService: ILoggerAdapter) => {
        return new DrugRejectUsecase(drugRepository, loggerService);
      },
      inject: [IDrugRepository, ILoggerAdapter]
    }
  ]
})
export class AppModule {}
