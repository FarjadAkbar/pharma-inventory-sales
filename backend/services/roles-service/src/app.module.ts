import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IPermissionRepository } from '@pharma/core/permission/repository/permission';
import { RoleEntity } from '@pharma/core/role/entity/role';
import { IRoleRepository } from '@pharma/core/role/repository/role';
import { RoleAddPermissionUsecase } from '@pharma/core/role/use-cases/role-add-permission';
import { RoleCreateUsecase } from '@pharma/core/role/use-cases/role-create';
import { RoleDeleteUsecase } from '@pharma/core/role/use-cases/role-delete';
import { RoleDeletePermissionUsecase } from '@pharma/core/role/use-cases/role-delete-permission';
import { RoleGetByIdUsecase } from '@pharma/core/role/use-cases/role-get-by-id';
import { RoleListUsecase } from '@pharma/core/role/use-cases/role-list';
import { RoleUpdateUsecase } from '@pharma/core/role/use-cases/role-update';
import { RoleSchema } from '@pharma/infra/database/postgres/schemas/role';
import { PermissionSchema } from '@pharma/infra/database/postgres/schemas/permission';
import { InfraModule } from '@pharma/infra/module';
import { RedisCacheModule } from '@pharma/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@pharma/infra/logger';
import { LibModule } from '@pharma/libs/module';

import { RolesController } from './roles.controller';
import {
  IRoleAddPermissionAdapter,
  IRoleCreateAdapter,
  IRoleDeleteAdapter,
  IRoleDeletePermissionAdapter,
  IRoleGetByIdAdapter,
  IRoleListAdapter,
  IRoleUpdateAdapter
} from './adapters';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionEntity } from '@pharma/core/permission/entity/permission';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    RedisCacheModule,
    TypeOrmModule.forFeature([RoleSchema, PermissionSchema])
  ],
  controllers: [RolesController],
  providers: [
    {
      provide: IRoleRepository,
      useFactory: (repository: Repository<RoleSchema & RoleEntity>) => {
        return new RoleRepository(repository);
      },
      inject: [getRepositoryToken(RoleSchema)]
    },
    {
      provide: IPermissionRepository,
      useFactory: (repository: Repository<PermissionSchema & PermissionEntity>) => {
        return new PermissionRepository(repository);
      },
      inject: [getRepositoryToken(PermissionSchema)]
    },
    {
      provide: IRoleCreateAdapter,
      useFactory: (logger: ILoggerAdapter, repository: IRoleRepository) => new RoleCreateUsecase(repository, logger),
      inject: [ILoggerAdapter, IRoleRepository]
    },
    {
      provide: IRoleUpdateAdapter,
      useFactory: (logger: ILoggerAdapter, repository: IRoleRepository) => new RoleUpdateUsecase(repository, logger),
      inject: [ILoggerAdapter, IRoleRepository]
    },
    {
      provide: IRoleGetByIdAdapter,
      useFactory: (repository: IRoleRepository) => new RoleGetByIdUsecase(repository),
      inject: [IRoleRepository]
    },
    {
      provide: IRoleListAdapter,
      useFactory: (repository: IRoleRepository) => new RoleListUsecase(repository),
      inject: [IRoleRepository]
    },
    {
      provide: IRoleDeleteAdapter,
      useFactory: (repository: IRoleRepository) => new RoleDeleteUsecase(repository),
      inject: [IRoleRepository]
    },
    {
      provide: IRoleAddPermissionAdapter,
      useFactory: (repository: IRoleRepository, permissionRepository: IPermissionRepository) =>
        new RoleAddPermissionUsecase(repository, permissionRepository),
      inject: [IRoleRepository, IPermissionRepository]
    },
    {
      provide: IRoleDeletePermissionAdapter,
      useFactory: (repository: IRoleRepository, permissionRepository: IPermissionRepository) =>
        new RoleDeletePermissionUsecase(repository, permissionRepository),
      inject: [IRoleRepository, IPermissionRepository]
    }
  ]
})
export class AppModule {}
