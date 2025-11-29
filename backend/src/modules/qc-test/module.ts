import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QCTestEntity } from '@/core/qc-test/entity/qc-test';
import { IQCTestRepository } from '@/core/qc-test/repository/qc-test';
import { QCTestCreateUsecase } from '@/core/qc-test/use-cases/qc-test-create';
import { QCTestListUsecase } from '@/core/qc-test/use-cases/qc-test-list';
import { RedisCacheModule } from '@/infra/cache/redis';
import { QCTestSchema } from '@/infra/database/postgres/schemas/qc-test';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';

import { IQCTestCreateAdapter, IQCTestListAdapter } from './adapter';
import { QCTestController } from './controller';
import { QCTestRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([QCTestSchema])
  ],
  controllers: [QCTestController],
  providers: [
    {
      provide: IQCTestRepository,
      useFactory: (repository: Repository<QCTestSchema & QCTestEntity>) => {
        return new QCTestRepository(repository);
      },
      inject: [getRepositoryToken(QCTestSchema)]
    },
    {
      provide: IQCTestCreateAdapter,
      useFactory: (
        qcTestRepository: IQCTestRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new QCTestCreateUsecase(qcTestRepository, loggerService, event);
      },
      inject: [IQCTestRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IQCTestListAdapter,
      useFactory: (qcTestRepository: IQCTestRepository) => {
        return new QCTestListUsecase(qcTestRepository);
      },
      inject: [IQCTestRepository]
    }
  ],
  exports: [IQCTestRepository, IQCTestCreateAdapter, IQCTestListAdapter]
})
export class QCTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(QCTestController);
  }
}
