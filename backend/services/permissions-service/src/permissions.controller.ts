import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  PERMISSIONS_CREATE,
  PERMISSIONS_DELETE,
  PERMISSIONS_GET_BY_ID,
  PERMISSIONS_LIST,
  PERMISSIONS_UPDATE
} from '@shared/constants/message-patterns';

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
  async create(@Payload() data: unknown) {
    return this.createUsecase.execute(data as any);
  }

  @MessagePattern(PERMISSIONS_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string }) {
    return this.updateUsecase.execute({ ...data.body, id: data.id } as any);
  }

  @MessagePattern(PERMISSIONS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(PERMISSIONS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(PERMISSIONS_DELETE)
  async delete(@Payload() data: { id?: string }) {
    return this.deleteUsecase.execute(data as any);
  }
}
