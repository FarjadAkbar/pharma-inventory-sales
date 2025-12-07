import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_REFRESH_TOKEN,
  AUTH_RESET_PASSWORD_CONFIRM,
  AUTH_RESET_PASSWORD_SEND_EMAIL
} from '@pharma/utils/constants/message-patterns';

import { LoginInput } from '@pharma/core/user/use-cases/user-login';
import { RefreshTokenInput } from '@pharma/core/user/use-cases/user-refresh-token';
import { LogoutInput } from '@pharma/core/user/use-cases/user-logout';
import { ResetPasswordSendEmailInput } from '@pharma/core/reset-password/use-cases/reset-password-send-email';
import { ResetPasswordConfirmInput } from '@pharma/core/reset-password/use-cases/reset-password-confirm';
import { ApiTrancingInput } from '@pharma/utils/request';

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
  async login(@Payload() data: { body?: LoginInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.loginUsecase.execute(
      data.body as LoginInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(AUTH_REFRESH_TOKEN)
  async refreshToken(@Payload() data: { body?: RefreshTokenInput }) {
    return this.refreshTokenUsecase.execute(data.body as RefreshTokenInput);
  }

  @MessagePattern(AUTH_LOGOUT)
  async logout(@Payload() data: { body?: LogoutInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.logoutUsecase.execute(
      data.body as LogoutInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(AUTH_RESET_PASSWORD_SEND_EMAIL)
  async sendResetPasswordEmail(@Payload() data: { body?: ResetPasswordSendEmailInput }) {
    return this.sendEmailResetPasswordUsecase.execute(data.body as ResetPasswordSendEmailInput);
  }

  @MessagePattern(AUTH_RESET_PASSWORD_CONFIRM)
  async confirmResetPassword(@Payload() data: { body?: Partial<ResetPasswordConfirmInput>; token?: string }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.confirmResetPasswordUsecase.execute({ ...body, token: data.token } as ResetPasswordConfirmInput);
  }
}
