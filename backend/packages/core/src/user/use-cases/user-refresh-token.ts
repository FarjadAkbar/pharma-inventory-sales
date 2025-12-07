import { ITokenAdapter } from '@pharma/libs/token';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiBadRequestException, ApiNotFoundException } from '@pharma/utils/exception';
import { UserRequest } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { IUserRepository } from '../repository/user';

export const RefreshTokenSchema = InputValidator.object({ refreshToken: InputValidator.string().trim().min(1) });

export class RefreshTokenUsecase implements IUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenAdapter
  ) {}

  @ValidateSchema(RefreshTokenSchema)
  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const userToken = await this.tokenService.verify<UserRefreshTokenVerifyInput>(input.refreshToken);

    if (!userToken.userId) {
      throw new ApiBadRequestException('incorrectToken');
    }

    const user = await this.userRepository.findOne({
      id: userToken.userId
    });

    if (!user) {
      throw new ApiNotFoundException('userNotFound');
    }

    if (!user.roles.length) {
      throw new ApiNotFoundException('roleNotFound');
    }

    const { token } = this.tokenService.sign({
      email: user.email,
      name: user.name,
      id: user.id
    } as UserRequest);

    const { token: refreshToken } = this.tokenService.sign({ userId: user.id });

    return { accessToken: token, refreshToken };
  }
}

export type RefreshTokenInput = Infer<typeof RefreshTokenSchema>;
export type RefreshTokenOutput = { accessToken: string; refreshToken: string };

export type UserRefreshTokenVerifyInput = {
  userId: string | null;
};
