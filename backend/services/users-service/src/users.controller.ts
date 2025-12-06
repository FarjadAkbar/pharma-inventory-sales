import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  USERS_CREATE,
  USERS_DELETE,
  USERS_GET_BY_ID,
  USERS_GET_CURRENT,
  USERS_LIST,
  USERS_UPDATE
} from '@/constants/message-patterns';

import { UserCreateInput } from '@/core/user/use-cases/user-create';
import { UserUpdateInput } from '@/core/user/use-cases/user-update';
import { UserDeleteInput } from '@/core/user/use-cases/user-delete';
import { UserGetByIdInput } from '@/core/user/use-cases/user-get-by-id';
import { UserListInput } from '@/core/user/use-cases/user-list';
import { ApiTrancingInput } from '@/utils/request';

import {
  IUserCreateAdapter,
  IUserDeleteAdapter,
  IUserGetByIdAdapter,
  IUserListAdapter,
  IUserUpdateAdapter
} from './adapters';

@Controller()
export class UsersController {
  constructor(
    private readonly createUsecase: IUserCreateAdapter,
    private readonly updateUsecase: IUserUpdateAdapter,
    private readonly deleteUsecase: IUserDeleteAdapter,
    private readonly listUsecase: IUserListAdapter,
    private readonly getByIdUsecase: IUserGetByIdAdapter
  ) {}

  @MessagePattern(USERS_CREATE)
  async create(@Payload() data: { body?: UserCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as UserCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(USERS_UPDATE)
  async update(@Payload() data: { body?: Partial<UserUpdateInput>; id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.updateUsecase.execute(
      { ...body, id: data.id } as UserUpdateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(USERS_LIST)
  async list(@Payload() data: UserListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(USERS_GET_BY_ID)
  async getById(@Payload() data: UserGetByIdInput) {
    return this.getByIdUsecase.execute(data);
  }

  @MessagePattern(USERS_GET_CURRENT)
  async getCurrent(@Payload() data: { user?: ApiTrancingInput['user'] }) {
    return data.user;
  }

  @MessagePattern(USERS_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.deleteUsecase.execute(
      { id: data.id } as UserDeleteInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }
}
