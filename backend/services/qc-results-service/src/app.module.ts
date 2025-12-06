import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QCResultEntity } from '@/core/qc-result/entity/qc-result';
import { IQCResultRepository } from '@/core/qc-result/repository/qc-result';
import { QCResultCreateUsecase } from '@/core/qc-result/use-cases/qc-result-create';
import { QCResultListUsecase } from '@/core/qc-result/use-cases/qc-result-list';
import { QCResultSchema } from '@/infra/database/postgres/schemas/qc-result';
import { InfraModule } from '@/infra/module';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { LibModule } from '@/libs/module';

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
