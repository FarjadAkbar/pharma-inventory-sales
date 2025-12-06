import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QAReleaseEntity } from '@/core/qa-release/entity/qa-release';
import { IQAReleaseRepository } from '@/core/qa-release/repository/qa-release';
import { QAReleaseCreateUsecase } from '@/core/qa-release/use-cases/qa-release-create';
import { QAReleaseListUsecase } from '@/core/qa-release/use-cases/qa-release-list';
import { QAReleaseSchema } from '@/infra/database/postgres/schemas/qa-release';
import { InfraModule } from '@/infra/module';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { LibModule } from '@/libs/module';

import { QAReleasesController } from './qa-releases.controller';
import { IQAReleaseCreateAdapter, IQAReleaseListAdapter } from './adapters';
import { QAReleaseRepository } from './repositories/qa-release.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([QAReleaseSchema])
  ],
  controllers: [QAReleasesController],
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
  ]
})
export class AppModule {}
