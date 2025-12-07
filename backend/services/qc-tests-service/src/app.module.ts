import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QCTestEntity } from '@pharma/core/qc-test/entity/qc-test';
import { IQCTestRepository } from '@pharma/core/qc-test/repository/qc-test';
import { QCTestCreateUsecase } from '@pharma/core/qc-test/use-cases/qc-test-create';
import { QCTestListUsecase } from '@pharma/core/qc-test/use-cases/qc-test-list';
import { QCTestSchema } from '@pharma/infra/database/postgres/schemas/qc-test';
import { InfraModule } from '@pharma/infra/module';
import { RedisCacheModule } from '@pharma/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { SecretsModule } from '@pharma/infra/secrets';
import { EventLibModule, IEventAdapter } from '@pharma/libs/event';
import { LibModule } from '@pharma/libs/module';

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
