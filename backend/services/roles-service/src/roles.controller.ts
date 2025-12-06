import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  ROLES_ADD_PERMISSION,
  ROLES_CREATE,
  ROLES_DELETE,
  ROLES_GET_BY_ID,
  ROLES_LIST,
  ROLES_REMOVE_PERMISSION,
  ROLES_UPDATE
} from '@shared/constants/message-patterns';

import {
  IRoleAddPermissionAdapter,
  IRoleCreateAdapter,
  IRoleDeleteAdapter,
  IRoleDeletePermissionAdapter,
  IRoleGetByIdAdapter,
  IRoleListAdapter,
  IRoleUpdateAdapter
} from './adapters';

@Controller()
export class RolesController {
  constructor(
    private readonly createUsecase: IRoleCreateAdapter,
    private readonly updateUsecase: IRoleUpdateAdapter,
    private readonly getByIdUsecase: IRoleGetByIdAdapter,
    private readonly listUsecase: IRoleListAdapter,
    private readonly deleteUsecase: IRoleDeleteAdapter,
    private readonly addPermissionUsecase: IRoleAddPermissionAdapter,
    private readonly deletePermissionUsecase: IRoleDeletePermissionAdapter
  ) {}

  @MessagePattern(ROLES_CREATE)
  async create(@Payload() data: unknown) {
    return this.createUsecase.execute(data as any);
  }

  @MessagePattern(ROLES_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string }) {
    return this.updateUsecase.execute({ ...data.body, id: data.id } as any);
  }

  @MessagePattern(ROLES_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(ROLES_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(ROLES_DELETE)
  async delete(@Payload() data: { id?: string }) {
    return this.deleteUsecase.execute(data as any);
  }

  @MessagePattern(ROLES_ADD_PERMISSION)
  async addPermission(@Payload() data: { body?: unknown; id?: string }) {
    return this.addPermissionUsecase.execute({ ...data.body, id: data.id } as any);
  }

  @MessagePattern(ROLES_REMOVE_PERMISSION)
  async removePermission(@Payload() data: { body?: unknown; id?: string }) {
    return this.deletePermissionUsecase.execute({ ...data.body, id: data.id } as any);
  }
}
