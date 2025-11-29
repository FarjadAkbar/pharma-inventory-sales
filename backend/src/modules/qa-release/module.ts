import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QAReleaseEntity } from '@/core/qa-release/entity/qa-release';
import { IQAReleaseRepository } from '@/core/qa-release/repository/qa-release';
import { QAReleaseCreateUsecase } from '@/core/qa-release/use-cases/qa-release-create';
import { QAReleaseListUsecase } from '@/core/qa-release/use-cases/qa-release-list';
import { RedisCacheModule } from '@/infra/cache/redis';
import { QAReleaseSchema } from '@/infra/database/postgres/schemas/qa-release';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';

import { IQAReleaseCreateAdapter, IQAReleaseListAdapter } from './adapter';
import { QAReleaseController } from './controller';
import { QAReleaseRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([QAReleaseSchema])
  ],
  controllers: [QAReleaseController],
  providers: [
    {
      provide: IQAReleaseRepository,
      useFactory: (repository: Repository<QAReleaseSchema & QAReleaseEntity>) => {
        return new QAReleaseRepository(repository);
      },
      inject: [getRepositoryToken(QAReleaseSchema)]
    },
    {
      provide: IQAReleaseCreateAdapter,
      useFactory: (
        qaReleaseRepository: IQAReleaseRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new QAReleaseCreateUsecase(qaReleaseRepository, loggerService, event);
      },
      inject: [IQAReleaseRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IQAReleaseListAdapter,
      useFactory: (qaReleaseRepository: IQAReleaseRepository) => {
        return new QAReleaseListUsecase(qaReleaseRepository);
      },
      inject: [IQAReleaseRepository]
    }
  ],
  exports: [IQAReleaseRepository, IQAReleaseCreateAdapter, IQAReleaseListAdapter]
})
export class QAReleaseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(QAReleaseController);
  }
}
