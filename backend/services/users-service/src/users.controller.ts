import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  USERS_CREATE,
  USERS_DELETE,
  USERS_GET_BY_ID,
  USERS_GET_CURRENT,
  USERS_LIST,
  USERS_UPDATE
} from '@shared/constants/message-patterns';

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
  async create(@Payload() data: { body: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(USERS_UPDATE)
  async update(@Payload() data: { body: unknown; id?: string; user?: unknown; tracing?: unknown }) {
    return this.updateUsecase.execute({ ...data.body, id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(USERS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(USERS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(USERS_GET_CURRENT)
  async getCurrent(@Payload() data: { user?: unknown }) {
    return data.user;
  }

  @MessagePattern(USERS_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    return this.deleteUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }
}
