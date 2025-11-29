import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QCSampleEntity } from '@/core/qc-sample/entity/qc-sample';
import { IQCSampleRepository } from '@/core/qc-sample/repository/qc-sample';
import { QCSampleCreateUsecase } from '@/core/qc-sample/use-cases/qc-sample-create';
import { QCSampleListUsecase } from '@/core/qc-sample/use-cases/qc-sample-list';
import { QCSampleAssignUsecase } from '@/core/qc-sample/use-cases/qc-sample-assign';
import { QCSampleCompleteUsecase } from '@/core/qc-sample/use-cases/qc-sample-complete';
import { RedisCacheModule } from '@/infra/cache/redis';
import { QCSampleSchema } from '@/infra/database/postgres/schemas/qc-sample';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';

import {
  IQCSampleCreateAdapter,
  IQCSampleListAdapter,
  IQCSampleAssignAdapter,
  IQCSampleCompleteAdapter
} from './adapter';
import { QCSampleController } from './controller';
import { QCSampleRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([QCSampleSchema])
  ],
  controllers: [QCSampleController],
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
  ],
  exports: [
    IQCSampleRepository,
    IQCSampleCreateAdapter,
    IQCSampleListAdapter,
    IQCSampleAssignAdapter,
    IQCSampleCompleteAdapter
  ]
})
export class QCSampleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(QCSampleController);
  }
}
