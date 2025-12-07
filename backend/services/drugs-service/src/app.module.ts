import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DrugEntity } from '@pharma/core/drug/entity/drug';
import { IDrugRepository } from '@pharma/core/drug/repository/drug';
import { DrugCreateUsecase } from '@pharma/core/drug/use-cases/drug-create';
import { DrugDeleteUsecase } from '@pharma/core/drug/use-cases/drug-delete';
import { DrugGetByIdUsecase } from '@pharma/core/drug/use-cases/drug-get-by-id';
import { DrugListUsecase } from '@pharma/core/drug/use-cases/drug-list';
import { DrugUpdateUsecase } from '@pharma/core/drug/use-cases/drug-update';
import { DrugApproveUsecase } from '@pharma/core/drug/use-cases/drug-approve';
import { DrugRejectUsecase } from '@pharma/core/drug/use-cases/drug-reject';
import { DrugSchema } from '@pharma/infra/database/postgres/schemas/drug';
import { InfraModule } from '@pharma/infra/module';
import { RedisCacheModule } from '@pharma/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { SecretsModule } from '@pharma/infra/secrets';
import { EventLibModule, IEventAdapter } from '@pharma/libs/event';
import { LibModule } from '@pharma/libs/module';

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
