import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  PERMISSIONS_CREATE,
  PERMISSIONS_DELETE,
  PERMISSIONS_GET_BY_ID,
  PERMISSIONS_LIST,
  PERMISSIONS_UPDATE
} from '@pharma/utils';

import { PermissionCreateInput } from '@pharma/core/permission/use-cases/permission-create';
import { PermissionUpdateInput } from '@pharma/core/permission/use-cases/permission-update';
import { PermissionGetByIdInput } from '@pharma/core/permission/use-cases/permission-get-by-id';
import { PermissionListInput } from '@pharma/core/permission/use-cases/permission-list';
import { PermissionDeleteInput } from '@pharma/core/permission/use-cases/permission-delete';

import {
  IPermissionCreateAdapter,
  IPermissionDeleteAdapter,
  IPermissionGetByIdAdapter,
  IPermissionListAdapter,
  IPermissionUpdateAdapter
} from './adapters';

@Controller()
export class PermissionsController {
  constructor(
    private readonly createUsecase: IPermissionCreateAdapter,
    private readonly updateUsecase: IPermissionUpdateAdapter,
    private readonly getByIdUsecase: IPermissionGetByIdAdapter,
    private readonly listUsecase: IPermissionListAdapter,
    private readonly deleteUsecase: IPermissionDeleteAdapter
  ) {}

  @MessagePattern(PERMISSIONS_CREATE)
  async create(@Payload() data: PermissionCreateInput) {
    return this.createUsecase.execute(data);
  }

  @MessagePattern(PERMISSIONS_UPDATE)
  async update(@Payload() data: { body?: Partial<PermissionUpdateInput>; id?: string }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.updateUsecase.execute({ ...body, id: data.id } as PermissionUpdateInput);
  }

  @MessagePattern(PERMISSIONS_GET_BY_ID)
  async getById(@Payload() data: PermissionGetByIdInput) {
    return this.getByIdUsecase.execute(data);
  }

  @MessagePattern(PERMISSIONS_LIST)
  async list(@Payload() data: PermissionListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(PERMISSIONS_DELETE)
  async delete(@Payload() data: PermissionDeleteInput) {
    return this.deleteUsecase.execute(data);
  }
}
