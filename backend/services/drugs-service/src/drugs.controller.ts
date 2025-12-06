import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { DRUGS_CREATE, DRUGS_DELETE, DRUGS_GET_BY_ID, DRUGS_LIST, DRUGS_UPDATE } from '@shared/constants/message-patterns';

import {
  IDrugCreateAdapter,
  IDrugDeleteAdapter,
  IDrugGetByIdAdapter,
  IDrugListAdapter,
  IDrugUpdateAdapter,
  IDrugApproveAdapter,
  IDrugRejectAdapter
} from './adapters';

@Controller()
export class DrugsController {
  constructor(
    private readonly createUsecase: IDrugCreateAdapter,
    private readonly updateUsecase: IDrugUpdateAdapter,
    private readonly deleteUsecase: IDrugDeleteAdapter,
    private readonly listUsecase: IDrugListAdapter,
    private readonly getByIdUsecase: IDrugGetByIdAdapter,
    private readonly approveUsecase: IDrugApproveAdapter,
    private readonly rejectUsecase: IDrugRejectAdapter
  ) {}

  @MessagePattern(DRUGS_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(DRUGS_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: unknown; tracing?: unknown; action?: string }) {
    if (data.action === 'approve') {
      return this.approveUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
    }
    if (data.action === 'reject') {
      return this.rejectUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
    }
    return this.updateUsecase.execute({ ...data.body, id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(DRUGS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(DRUGS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(DRUGS_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    return this.deleteUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }
}
