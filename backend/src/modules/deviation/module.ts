import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DeviationEntity } from '@/core/deviation/entity/deviation';
import { IDeviationRepository } from '@/core/deviation/repository/deviation';
import { DeviationCreateUsecase } from '@/core/deviation/use-cases/deviation-create';
import { DeviationUpdateUsecase } from '@/core/deviation/use-cases/deviation-update';
import { DeviationListUsecase } from '@/core/deviation/use-cases/deviation-list';
import { DeviationCloseUsecase } from '@/core/deviation/use-cases/deviation-close';
import { RedisCacheModule } from '@/infra/cache/redis';
import { DeviationSchema } from '@/infra/database/postgres/schemas/deviation';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';

import { IDeviationCreateAdapter, IDeviationUpdateAdapter, IDeviationListAdapter, IDeviationCloseAdapter } from './adapter';
import { DeviationController } from './controller';
import { DeviationRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([DeviationSchema])
  ],
  controllers: [DeviationController],
  providers: [
    {
      provide: IDeviationRepository,
      useFactory: (repository: Repository<DeviationSchema & DeviationEntity>) => {
        return new DeviationRepository(repository);
      },
      inject: [getRepositoryToken(DeviationSchema)]
    },
    {
      provide: IDeviationCreateAdapter,
      useFactory: (
        deviationRepository: IDeviationRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter
      ) => {
        return new DeviationCreateUsecase(deviationRepository, loggerService, event);
      },
      inject: [IDeviationRepository, ILoggerAdapter, IEventAdapter]
    },
    {
      provide: IDeviationUpdateAdapter,
      useFactory: (deviationRepository: IDeviationRepository, loggerService: ILoggerAdapter) => {
        return new DeviationUpdateUsecase(deviationRepository, loggerService);
      },
      inject: [IDeviationRepository, ILoggerAdapter]
    },
    {
      provide: IDeviationListAdapter,
      useFactory: (deviationRepository: IDeviationRepository) => {
        return new DeviationListUsecase(deviationRepository);
      },
      inject: [IDeviationRepository]
    },
    {
      provide: IDeviationCloseAdapter,
      useFactory: (deviationRepository: IDeviationRepository, loggerService: ILoggerAdapter) => {
        return new DeviationCloseUsecase(deviationRepository, loggerService);
      },
      inject: [IDeviationRepository, ILoggerAdapter]
    }
  ],
  exports: [IDeviationRepository, IDeviationCreateAdapter, IDeviationUpdateAdapter, IDeviationListAdapter, IDeviationCloseAdapter]
})
export class DeviationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(DeviationController);
  }
}
