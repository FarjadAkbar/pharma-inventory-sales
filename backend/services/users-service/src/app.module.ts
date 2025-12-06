import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IRoleRepository } from '@/core/role/repository/role';
import { UserEntity } from '@/core/user/entity/user';
import { IUserRepository } from '@/core/user/repository/user';
import { UserChangePasswordUsecase } from '@/core/user/use-cases/user-change-password';
import { UserCreateUsecase } from '@/core/user/use-cases/user-create';
import { UserDeleteUsecase } from '@/core/user/use-cases/user-delete';
import { UserGetByIdUsecase } from '@/core/user/use-cases/user-get-by-id';
import { UserListUsecase } from '@/core/user/use-cases/user-list';
import { UserUpdateUsecase } from '@/core/user/use-cases/user-update';
import { UserSchema } from '@/infra/database/postgres/schemas/user';
import { RoleSchema } from '@/infra/database/postgres/schemas/role';
import { InfraModule } from '@/infra/module';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { LibModule } from '@/libs/module';

import { UsersController } from './users.controller';
import {
  IUserChangePasswordAdapter,
  IUserCreateAdapter,
  IUserDeleteAdapter,
  IUserGetByIdAdapter,
  IUserListAdapter,
  IUserUpdateAdapter
} from './adapters';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([UserSchema, RoleSchema])
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: IUserRepository,
      useFactory: (repository: Repository<UserSchema & UserEntity>) => {
        return new UserRepository(repository);
      },
      inject: [getRepositoryToken(UserSchema)]
    },
    {
      provide: IRoleRepository,
      useFactory: (repository: Repository<RoleSchema & RoleEntity>) => {
        return new RoleRepository(repository);
      },
      inject: [getRepositoryToken(RoleSchema)]
    },
    {
      provide: IUserCreateAdapter,
      useFactory: (
        userRepository: IUserRepository,
        loggerService: ILoggerAdapter,
        event: IEventAdapter,
        roleRepository: IRoleRepository
      ) => {
        return new UserCreateUsecase(userRepository, loggerService, event, roleRepository);
      },
      inject: [IUserRepository, ILoggerAdapter, IEventAdapter, IRoleRepository]
    },
    {
      provide: IUserUpdateAdapter,
      useFactory: (userRepository: IUserRepository, loggerService: ILoggerAdapter, roleRepository: IRoleRepository) => {
        return new UserUpdateUsecase(userRepository, loggerService, roleRepository);
      },
      inject: [IUserRepository, ILoggerAdapter, IRoleRepository]
    },
    {
      provide: IUserListAdapter,
      useFactory: (userRepository: IUserRepository) => {
        return new UserListUsecase(userRepository);
      },
      inject: [IUserRepository]
    },
    {
      provide: IUserDeleteAdapter,
      useFactory: (userRepository: IUserRepository) => {
        return new UserDeleteUsecase(userRepository);
      },
      inject: [IUserRepository]
    },
    {
      provide: IUserGetByIdAdapter,
      useFactory: (userRepository: IUserRepository) => {
        return new UserGetByIdUsecase(userRepository);
      },
      inject: [IUserRepository]
    },
    {
      provide: IUserChangePasswordAdapter,
      useFactory: (userRepository: IUserRepository) => {
        return new UserChangePasswordUsecase(userRepository);
      },
      inject: [IUserRepository]
    }
  ]
})
export class AppModule {}
