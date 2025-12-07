import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PermissionEntity } from '@pharma/core/permission/entity/permission';
import { IPermissionRepository } from '@pharma/core/permission/repository/permission';
import { PermissionCreateUsecase } from '@pharma/core/permission/use-cases/permission-create';
import { PermissionDeleteUsecase } from '@pharma/core/permission/use-cases/permission-delete';
import { PermissionGetByIdUsecase } from '@pharma/core/permission/use-cases/permission-get-by-id';
import { PermissionListUsecase } from '@pharma/core/permission/use-cases/permission-list';
import { PermissionUpdateUsecase } from '@pharma/core/permission/use-cases/permission-update';
import { PermissionSchema } from '@pharma/infra/database/postgres/schemas/permission';
import { InfraModule } from '@pharma/infra/module';
import { RedisCacheModule } from '@pharma/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { LibModule } from '@pharma/libs/module';

import { PermissionsController } from './permissions.controller';
import {
  IPermissionCreateAdapter,
  IPermissionDeleteAdapter,
  IPermissionGetByIdAdapter,
  IPermissionListAdapter,
  IPermissionUpdateAdapter
} from './adapters';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    RedisCacheModule,
    TypeOrmModule.forFeature([PermissionSchema])
  ],
  controllers: [PermissionsController],
  providers: [
    {
      provide: IPermissionRepository,
      useFactory: (repository: Repository<PermissionSchema & PermissionEntity>) => {
        return new PermissionRepository(repository);
      },
      inject: [getRepositoryToken(PermissionSchema)]
    },
    {
      provide: IPermissionCreateAdapter,
      useFactory: (logger: ILoggerAdapter, repository: IPermissionRepository) =>
        new PermissionCreateUsecase(repository, logger),
      inject: [ILoggerAdapter, IPermissionRepository]
    },
    {
      provide: IPermissionUpdateAdapter,
      useFactory: (logger: ILoggerAdapter, repository: IPermissionRepository) =>
        new PermissionUpdateUsecase(repository, logger),
      inject: [ILoggerAdapter, IPermissionRepository]
    },
    {
      provide: IPermissionGetByIdAdapter,
      useFactory: (repository: IPermissionRepository) => new PermissionGetByIdUsecase(repository),
      inject: [IPermissionRepository]
    },
    {
      provide: IPermissionListAdapter,
      useFactory: (repository: IPermissionRepository) => new PermissionListUsecase(repository),
      inject: [IPermissionRepository]
    },
    {
      provide: IPermissionDeleteAdapter,
      useFactory: (repository: IPermissionRepository) => new PermissionDeleteUsecase(repository),
      inject: [IPermissionRepository]
    }
  ]
})
export class AppModule {}
