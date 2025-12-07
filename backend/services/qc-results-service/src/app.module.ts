import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QCResultEntity } from '@pharma/core/qc-result/entity/qc-result';
import { IQCResultRepository } from '@pharma/core/qc-result/repository/qc-result';
import { QCResultCreateUsecase } from '@pharma/core/qc-result/use-cases/qc-result-create';
import { QCResultListUsecase } from '@pharma/core/qc-result/use-cases/qc-result-list';
import { QCResultSchema } from '@pharma/infra/database/postgres/schemas/qc-result';
import { InfraModule } from '@pharma/infra/module';
import { RedisCacheModule } from '@pharma/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { SecretsModule } from '@pharma/infra/secrets';
import { EventLibModule, IEventAdapter } from '@pharma/libs/event';
import { LibModule } from '@pharma/libs/module';

import { QCResultsController } from './qc-results.controller';
import { IQCResultCreateAdapter, IQCResultListAdapter } from './adapters';
import { QCResultRepository } from './repositories/qc-result.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([QCResultSchema])
  ],
  controllers: [QCResultsController],
  providers: [
    {
      provide: IQCResultRepository,
      useFactory: (repository: Repository<QCResultSchema & QCResultEntity>) => {
        return new QCResultRepository(repository);
      },
      inject: [getRepositoryToken(QCResultSchema)]
    },
    {
      provide: IQCResultCreateAdapter,
      useFactory: (
        qcResultRepository: IQCResultRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new QCResultCreateUsecase(qcResultRepository, loggerService, event);
      },
      inject: [IQCResultRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IQCResultListAdapter,
      useFactory: (qcResultRepository: IQCResultRepository) => {
        return new QCResultListUsecase(qcResultRepository);
      },
      inject: [IQCResultRepository]
    }
  ]
})
export class AppModule {}
