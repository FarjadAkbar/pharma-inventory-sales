import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QCResultEntity } from '@/core/qc-result/entity/qc-result';
import { IQCResultRepository } from '@/core/qc-result/repository/qc-result';
import { QCResultCreateUsecase } from '@/core/qc-result/use-cases/qc-result-create';
import { QCResultListUsecase } from '@/core/qc-result/use-cases/qc-result-list';
import { RedisCacheModule } from '@/infra/cache/redis';
import { QCResultSchema } from '@/infra/database/postgres/schemas/qc-result';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';

import { IQCResultCreateAdapter, IQCResultListAdapter } from './adapter';
import { QCResultController } from './controller';
import { QCResultRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([QCResultSchema])
  ],
  controllers: [QCResultController],
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
  ],
  exports: [IQCResultRepository, IQCResultCreateAdapter, IQCResultListAdapter]
})
export class QCResultModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(QCResultController);
  }
}
