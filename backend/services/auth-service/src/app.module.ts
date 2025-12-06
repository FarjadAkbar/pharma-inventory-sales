import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IUserRepository } from '@/core/user/repository/user';
import { LoginUsecase } from '@/core/user/use-cases/user-login';
import { RefreshTokenUsecase } from '@/core/user/use-cases/user-refresh-token';
import { LogoutUsecase } from '@/core/user/use-cases/user-logout';
import { ResetPasswordEntity } from '@/core/reset-password/entity/reset-password';
import { IResetPasswordRepository } from '@/core/reset-password/repository/reset-password';
import { ResetPasswordConfirmUsecase } from '@/core/reset-password/use-cases/reset-password-confirm';
import { ResetPasswordSendEmailUsecase } from '@/core/reset-password/use-cases/reset-password-send-email';
import { UserSchema } from '@/infra/database/postgres/schemas/user';
import { ResetPasswordSchema } from '@/infra/database/postgres/schemas/reset-password';
import { InfraModule } from '@/infra/module';
import { ICacheAdapter } from '@/infra/cache';
import { RedisCacheModule } from '@/infra/cache/redis';
import { ILoggerAdapter, LoggerModule } from '@/infra/logger';
import { ISecretsAdapter, SecretsModule } from '@/infra/secrets';
import { EventLibModule, IEventAdapter } from '@/libs/event';
import { ITokenAdapter, TokenLibModule } from '@/libs/token';
import { LibModule } from '@/libs/module';

import { AuthController } from './auth.controller';
import { ILoginAdapter, IRefreshTokenAdapter, ILogoutAdapter, IConfirmResetPasswordAdapter, ISendEmailResetPasswordAdapter } from './adapters';
import { UserRepository } from './repositories/user.repository';
import { ResetPasswordRepository } from './repositories/reset-password.repository';
import { UserEntity } from '@/core/user/entity/user';

@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule,
    SecretsModule,
    TokenLibModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([UserSchema, ResetPasswordSchema])
  ],
  controllers: [AuthController],
  providers: [
    // User Repository
    {
      provide: IUserRepository,
      useFactory: (repository: Repository<UserSchema & UserEntity>) => {
        return new UserRepository(repository);
      },
      inject: [getRepositoryToken(UserSchema)]
    },
    // Reset Password Repository
    {
      provide: IResetPasswordRepository,
      useFactory: (repository: Repository<ResetPasswordSchema & ResetPasswordEntity>) => {
        return new ResetPasswordRepository(repository);
      },
      inject: [getRepositoryToken(ResetPasswordSchema)]
    },
    // Login Use Cases
    {
      provide: ILoginAdapter,
      useFactory: (repository: IUserRepository, tokenService: ITokenAdapter) => {
        return new LoginUsecase(repository, tokenService);
      },
      inject: [IUserRepository, ITokenAdapter]
    },
    {
      provide: IRefreshTokenAdapter,
      useFactory: (repository: IUserRepository, tokenService: ITokenAdapter) => {
        return new RefreshTokenUsecase(repository, tokenService);
      },
      inject: [IUserRepository, ITokenAdapter]
    },
    // Logout Use Case
    {
      provide: ILogoutAdapter,
      useFactory: (cache: ICacheAdapter, secrets: ISecretsAdapter) => {
        return new LogoutUsecase(cache, secrets);
      },
      inject: [ICacheAdapter, ISecretsAdapter]
    },
    // Reset Password Use Cases
    {
      provide: ISendEmailResetPasswordAdapter,
      useFactory: (
        resetpasswordtokenRepository: IResetPasswordRepository,
        userRepository: IUserRepository,
        token: ITokenAdapter,
        event: IEventAdapter,
        secret: ISecretsAdapter
      ) => {
        return new ResetPasswordSendEmailUsecase(resetpasswordtokenRepository, userRepository, token, event, secret);
      },
      inject: [IResetPasswordRepository, IUserRepository, ITokenAdapter, IEventAdapter, ISecretsAdapter]
    },
    {
      provide: IConfirmResetPasswordAdapter,
      useFactory: (
        resetpasswordtokenRepository: IResetPasswordRepository,
        userRepository: IUserRepository,
        token: ITokenAdapter,
        event: IEventAdapter
      ) => {
        return new ResetPasswordConfirmUsecase(resetpasswordtokenRepository, userRepository, token, event);
      },
      inject: [IResetPasswordRepository, IUserRepository, ITokenAdapter, IEventAdapter]
    }
  ]
})
export class AppModule {}
