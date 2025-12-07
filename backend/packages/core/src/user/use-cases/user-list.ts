import { ValidateSchema } from '@pharma/utils/decorators';
import { PaginationInput, PaginationOutput, PaginationSchema } from '@pharma/utils/pagination';
import { SearchSchema } from '@pharma/utils/search';
import { SortSchema } from '@pharma/utils/sort';
import { IUsecase } from '@pharma/utils/usecase';
import { InputValidator } from '@pharma/utils/validator';

import { UserEntity } from '../entity/user';
import { IUserRepository } from '../repository/user';

export const UserListSchema = InputValidator.intersection(PaginationSchema, SortSchema.merge(SearchSchema));

export class UserListUsecase implements IUsecase {
  constructor(private readonly userRepository: IUserRepository) {}

  @ValidateSchema(UserListSchema)
  async execute(input: UserListInput): Promise<UserListOutput> {
    const users = await this.userRepository.paginate(input);

    return {
      docs: users.docs.map((user) => {
        const entity = new UserEntity(user);
        return entity;
      }),
      limit: users.limit,
      page: users.page,
      total: users.total
    };
  }
}

export type UserListInput = PaginationInput<UserEntity>;
export type UserListOutput = PaginationOutput<UserEntity>;
