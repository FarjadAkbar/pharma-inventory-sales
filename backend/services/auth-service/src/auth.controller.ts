import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_REFRESH_TOKEN,
  AUTH_RESET_PASSWORD_CONFIRM,
  AUTH_RESET_PASSWORD_SEND_EMAIL
} from '@shared/constants/message-patterns';

import {
  ILoginAdapter,
  IRefreshTokenAdapter,
  ILogoutAdapter,
  IConfirmResetPasswordAdapter,
  ISendEmailResetPasswordAdapter
} from './adapters';

@Controller()
export class AuthController {
  constructor(
    private readonly loginUsecase: ILoginAdapter,
    private readonly refreshTokenUsecase: IRefreshTokenAdapter,
    private readonly logoutUsecase: ILogoutAdapter,
    private readonly sendEmailResetPasswordUsecase: ISendEmailResetPasswordAdapter,
    private readonly confirmResetPasswordUsecase: IConfirmResetPasswordAdapter
  ) {}

  @MessagePattern(AUTH_LOGIN)
  async login(@Payload() data: { body: unknown; user?: unknown; tracing?: unknown }) {
    return this.loginUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(AUTH_REFRESH_TOKEN)
  async refreshToken(@Payload() data: { body: unknown }) {
    return this.refreshTokenUsecase.execute(data.body as any);
  }

  @MessagePattern(AUTH_LOGOUT)
  async logout(@Payload() data: { body: unknown; user?: unknown; tracing?: unknown }) {
    return this.logoutUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(AUTH_RESET_PASSWORD_SEND_EMAIL)
  async sendResetPasswordEmail(@Payload() data: { body: unknown }) {
    return this.sendEmailResetPasswordUsecase.execute(data.body as any);
  }

  @MessagePattern(AUTH_RESET_PASSWORD_CONFIRM)
  async confirmResetPassword(@Payload() data: { body: unknown; token?: string }) {
    return this.confirmResetPasswordUsecase.execute({ ...data.body, token: data.token } as any);
  }
}
