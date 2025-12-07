import { LoginInput, LoginOutput } from '@pharma/core/user/use-cases/user-login';
import { RefreshTokenInput, RefreshTokenOutput } from '@pharma/core/user/use-cases/user-refresh-token';
import { LogoutInput, LogoutOutput } from '@pharma/core/user/use-cases/user-logout';
import {
  ResetPasswordConfirmInput,
  ResetPasswordConfirmOutput
} from '@pharma/core/reset-password/use-cases/reset-password-confirm';
import {
  ResetPasswordSendEmailInput,
  ResetPasswordSendEmailOutput
} from '@pharma/core/reset-password/use-cases/reset-password-send-email';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';

export abstract class ILoginAdapter implements IUsecase {
  abstract execute(input: LoginInput, trace: ApiTrancingInput): Promise<LoginOutput>;
}

export abstract class IRefreshTokenAdapter implements IUsecase {
  abstract execute(input: RefreshTokenInput): Promise<RefreshTokenOutput>;
}

export abstract class ILogoutAdapter implements IUsecase {
  abstract execute(input: LogoutInput, trace: ApiTrancingInput): Promise<LogoutOutput>;
}

export abstract class ISendEmailResetPasswordAdapter implements IUsecase {
  abstract execute(input: ResetPasswordSendEmailInput): Promise<ResetPasswordSendEmailOutput>;
}

export abstract class IConfirmResetPasswordAdapter implements IUsecase {
  abstract execute(input: ResetPasswordConfirmInput): Promise<ResetPasswordConfirmOutput>;
}
