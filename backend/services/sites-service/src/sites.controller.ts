import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { SITES_CREATE, SITES_DELETE, SITES_GET_ALL, SITES_GET_BY_ID, SITES_LIST, SITES_UPDATE } from '@shared/constants/message-patterns';

import {
  ISiteCreateAdapter,
  ISiteDeleteAdapter,
  ISiteGetByIdAdapter,
  ISiteListAdapter,
  ISiteUpdateAdapter
} from './adapters';

@Controller()
export class SitesController {
  constructor(
    private readonly createUsecase: ISiteCreateAdapter,
    private readonly updateUsecase: ISiteUpdateAdapter,
    private readonly deleteUsecase: ISiteDeleteAdapter,
    private readonly listUsecase: ISiteListAdapter,
    private readonly getByIdUsecase: ISiteGetByIdAdapter
  ) {}

  @MessagePattern(SITES_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(SITES_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: unknown; tracing?: unknown }) {
    return this.updateUsecase.execute({ ...data.body, id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(SITES_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(SITES_GET_ALL)
  async getAll(@Payload() data: unknown) {
    return this.listUsecase.execute({ limit: 1000, page: 1 } as any);
  }

  @MessagePattern(SITES_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(SITES_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    return this.deleteUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }
}
