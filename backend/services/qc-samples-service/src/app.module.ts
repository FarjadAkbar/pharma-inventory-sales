import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QCSampleEntity } from '@pharma/core/qc-sample/entity/qc-sample';
import { IQCSampleRepository } from '@pharma/core/qc-sample/repository/qc-sample';
import { QCSampleCreateUsecase } from '@pharma/core/qc-sample/use-cases/qc-sample-create';
import { QCSampleListUsecase } from '@pharma/core/qc-sample/use-cases/qc-sample-list';
import { QCSampleAssignUsecase } from '@pharma/core/qc-sample/use-cases/qc-sample-assign';
import { QCSampleCompleteUsecase } from '@pharma/core/qc-sample/use-cases/qc-sample-complete';
import { QCSampleSchema } from '@pharma/infra/database/postgres/schemas/qc-sample';
import { InfraModule } from '@pharma/infra/module';
import { RedisCacheModule } from '@pharma/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { SecretsModule } from '@pharma/infra/secrets';
import { EventLibModule, IEventAdapter } from '@pharma/libs/event';
import { LibModule } from '@pharma/libs/module';

import { QCSamplesController } from './qc-samples.controller';
import {
  IQCSampleCreateAdapter,
  IQCSampleListAdapter,
  IQCSampleAssignAdapter,
  IQCSampleCompleteAdapter
} from './adapters';
import { QCSampleRepository } from './repositories/qc-sample.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([QCSampleSchema])
  ],
  controllers: [QCSamplesController],
  providers: [
    {
      provide: IQCSampleRepository,
      useFactory: (repository: Repository<QCSampleSchema & QCSampleEntity>) => {
        return new QCSampleRepository(repository);
      },
      inject: [getRepositoryToken(QCSampleSchema)]
    },
    {
      provide: IQCSampleCreateAdapter,
      useFactory: (
        qcSampleRepository: IQCSampleRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new QCSampleCreateUsecase(qcSampleRepository, loggerService, event);
      },
      inject: [IQCSampleRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IQCSampleListAdapter,
      useFactory: (qcSampleRepository: IQCSampleRepository) => {
        return new QCSampleListUsecase(qcSampleRepository);
      },
      inject: [IQCSampleRepository]
    },
    {
      provide: IQCSampleAssignAdapter,
      useFactory: (qcSampleRepository: IQCSampleRepository, loggerService: ILoggerAdapter) => {
        return new QCSampleAssignUsecase(qcSampleRepository, loggerService);
      },
      inject: [IQCSampleRepository, ILoggerAdapter]
    },
    {
      provide: IQCSampleCompleteAdapter,
      useFactory: (qcSampleRepository: IQCSampleRepository, loggerService: ILoggerAdapter) => {
        return new QCSampleCompleteUsecase(qcSampleRepository, loggerService);
      },
      inject: [IQCSampleRepository, ILoggerAdapter]
    }
  ]
})
export class AppModule {}
