import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  RAW_MATERIALS_CREATE,
  RAW_MATERIALS_DELETE,
  RAW_MATERIALS_GET_BY_ID,
  RAW_MATERIALS_LIST,
  RAW_MATERIALS_UPDATE
} from '@shared/constants/message-patterns';

import {
  IRawMaterialCreateAdapter,
  IRawMaterialDeleteAdapter,
  IRawMaterialGetByIdAdapter,
  IRawMaterialListAdapter,
  IRawMaterialUpdateAdapter
} from './adapters';

@Controller()
export class RawMaterialsController {
  constructor(
    private readonly createUsecase: IRawMaterialCreateAdapter,
    private readonly updateUsecase: IRawMaterialUpdateAdapter,
    private readonly deleteUsecase: IRawMaterialDeleteAdapter,
    private readonly listUsecase: IRawMaterialListAdapter,
    private readonly getByIdUsecase: IRawMaterialGetByIdAdapter
  ) {}

  @MessagePattern(RAW_MATERIALS_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(RAW_MATERIALS_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: unknown; tracing?: unknown }) {
    return this.updateUsecase.execute({ ...data.body, id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(RAW_MATERIALS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(RAW_MATERIALS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(RAW_MATERIALS_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    return this.deleteUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }
}
