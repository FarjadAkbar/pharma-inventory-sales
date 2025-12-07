import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { SITES_CREATE, SITES_DELETE, SITES_GET_ALL, SITES_GET_BY_ID, SITES_LIST, SITES_UPDATE } from '@pharma/utils/constants/message-patterns';

import { SiteCreateInput } from '@pharma/core/site/use-cases/site-create';
import { SiteUpdateInput } from '@pharma/core/site/use-cases/site-update';
import { SiteDeleteInput } from '@pharma/core/site/use-cases/site-delete';
import { SiteGetByIdInput } from '@pharma/core/site/use-cases/site-get-by-id';
import { SiteListInput } from '@pharma/core/site/use-cases/site-list';
import { ApiTrancingInput } from '@pharma/utils/request';

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
  async create(@Payload() data: { body?: SiteCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as SiteCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(SITES_UPDATE)
  async update(@Payload() data: { body?: Partial<SiteUpdateInput>; id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.updateUsecase.execute(
      { ...body, id: data.id } as SiteUpdateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(SITES_LIST)
  async list(@Payload() data: SiteListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(SITES_GET_ALL)
  async getAll(@Payload() data: unknown) {
    return this.listUsecase.execute({ limit: 1000, page: 1 } as SiteListInput);
  }

  @MessagePattern(SITES_GET_BY_ID)
  async getById(@Payload() data: SiteGetByIdInput) {
    return this.getByIdUsecase.execute(data);
  }

  @MessagePattern(SITES_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.deleteUsecase.execute(
      { id: data.id } as SiteDeleteInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }
}
