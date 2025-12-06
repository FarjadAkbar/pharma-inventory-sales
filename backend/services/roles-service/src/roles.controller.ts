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
} from '@/constants/message-patterns';

import { RoleCreateInput } from '@/core/role/use-cases/role-create';
import { RoleUpdateInput } from '@/core/role/use-cases/role-update';
import { RoleGetByIdInput } from '@/core/role/use-cases/role-get-by-id';
import { RoleListInput } from '@/core/role/use-cases/role-list';
import { RoleDeleteInput } from '@/core/role/use-cases/role-delete';
import { RoleAddPermissionInput } from '@/core/role/use-cases/role-add-permission';
import { RoleDeletePermissionInput } from '@/core/role/use-cases/role-delete-permission';

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
  async create(@Payload() data: RoleCreateInput) {
    return this.createUsecase.execute(data);
  }

  @MessagePattern(ROLES_UPDATE)
  async update(@Payload() data: { body?: Partial<RoleUpdateInput>; id?: string }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.updateUsecase.execute({ ...body, id: data.id } as RoleUpdateInput);
  }

  @MessagePattern(ROLES_GET_BY_ID)
  async getById(@Payload() data: RoleGetByIdInput) {
    return this.getByIdUsecase.execute(data);
  }

  @MessagePattern(ROLES_LIST)
  async list(@Payload() data: RoleListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(ROLES_DELETE)
  async delete(@Payload() data: RoleDeleteInput) {
    return this.deleteUsecase.execute(data);
  }

  @MessagePattern(ROLES_ADD_PERMISSION)
  async addPermission(@Payload() data: { body?: Partial<RoleAddPermissionInput>; id?: string }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.addPermissionUsecase.execute({ ...body, id: data.id } as RoleAddPermissionInput);
  }

  @MessagePattern(ROLES_REMOVE_PERMISSION)
  async removePermission(@Payload() data: { body?: Partial<RoleDeletePermissionInput>; id?: string }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.deletePermissionUsecase.execute({ ...body, id: data.id } as RoleDeletePermissionInput);
  }
}
