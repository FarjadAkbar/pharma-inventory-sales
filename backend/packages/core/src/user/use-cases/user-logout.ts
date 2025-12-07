import { ICacheAdapter } from '@pharma/infra/cache';
import { ISecretsAdapter } from '@pharma/infra/secrets';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

export const LogoutSchema = InputValidator.object({ token: InputValidator.string().trim().min(10) });

export class LogoutUsecase implements IUsecase {
  constructor(
    private readonly redis: ICacheAdapter,
    private readonly secretes: ISecretsAdapter
  ) {}

  @ValidateSchema(LogoutSchema)
  async execute(input: LogoutInput, { tracing, user }: ApiTrancingInput): LogoutOutput {
    await this.redis.set(input.token, input.token, { PX: this.secretes.TOKEN_EXPIRATION });

    tracing.logEvent('user-logout', `${user.email}`);
  }
}

export type LogoutInput = Infer<typeof LogoutSchema>;
export type LogoutOutput = Promise<void>;
