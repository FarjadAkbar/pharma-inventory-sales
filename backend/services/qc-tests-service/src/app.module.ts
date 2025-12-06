import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QCTestEntity } from '@/core/qc-test/entity/qc-test';
import { IQCTestRepository } from '@/core/qc-test/repository/qc-test';
import { QCTestCreateUsecase } from '@/core/qc-test/use-cases/qc-test-create';
import { QCTestListUsecase } from '@/core/qc-test/use-cases/qc-test-list';
import { QCTestSchema } from '@/infra/database/postgres/schemas/qc-test';
import { InfraModule } from '@/infra/module';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { LibModule } from '@/libs/module';

import { QCTestsController } from './qc-tests.controller';
import { IQCTestCreateAdapter, IQCTestListAdapter } from './adapters';
import { QCTestRepository } from './repositories/qc-test.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([QCTestSchema])
  ],
  controllers: [QCTestsController],
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
  ]
})
export class AppModule {}
