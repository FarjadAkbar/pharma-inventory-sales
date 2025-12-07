import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer } from '@pharma/utils/validator';

import { UserEntity, UserEntitySchema } from '../entity/user';
import { IUserRepository } from '../repository/user';

export const UserDeleteSchema = UserEntitySchema.pick({
  id: true
});

export class UserDeleteUsecase implements IUsecase {
  constructor(private readonly userRepository: IUserRepository) {}

  @ValidateSchema(UserDeleteSchema)
  async execute({ id }: UserDeleteInput, { tracing, user: userData }: ApiTrancingInput): Promise<UserDeleteOutput> {
    const user = await this.userRepository.findOneWithRelation({ id }, { password: true });

    if (!user) {
      throw new ApiNotFoundException('userNotFound');
    }

    const entity = new UserEntity(user);

    await this.userRepository.softRemove(entity);

    tracing.logEvent('user-deleted', `user: ${user.email} deleted by: ${userData.email}`);

    return entity;
  }
}

export type UserDeleteInput = Infer<typeof UserDeleteSchema>;
export type UserDeleteOutput = UserEntity;
