import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { DRUGS_CREATE, DRUGS_DELETE, DRUGS_GET_BY_ID, DRUGS_LIST, DRUGS_UPDATE } from '@/constants/message-patterns';

import { DrugCreateInput } from '@/core/drug/use-cases/drug-create';
import { DrugUpdateInput } from '@/core/drug/use-cases/drug-update';
import { DrugApproveInput } from '@/core/drug/use-cases/drug-approve';
import { DrugRejectInput } from '@/core/drug/use-cases/drug-reject';
import { DrugDeleteInput } from '@/core/drug/use-cases/drug-delete';
import { DrugGetByIdInput } from '@/core/drug/use-cases/drug-get-by-id';
import { DrugListInput } from '@/core/drug/repository/drug';
import { ApiTrancingInput } from '@/utils/request';

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
  async create(@Payload() data: { body?: DrugCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as DrugCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(DRUGS_UPDATE)
  async update(@Payload() data: { body?: Partial<DrugUpdateInput>; id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing']; action?: string }) {
    if (data.action === 'approve') {
      return this.approveUsecase.execute(
        { id: data.id } as DrugApproveInput,
        { user: data.user, tracing: data.tracing } as ApiTrancingInput
      );
    }
    if (data.action === 'reject') {
      return this.rejectUsecase.execute(
        { id: data.id } as DrugRejectInput,
        { user: data.user, tracing: data.tracing } as ApiTrancingInput
      );
    }
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.updateUsecase.execute(
      { ...body, id: data.id } as DrugUpdateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(DRUGS_LIST)
  async list(@Payload() data: DrugListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(DRUGS_GET_BY_ID)
  async getById(@Payload() data: DrugGetByIdInput) {
    return this.getByIdUsecase.execute(data);
  }

  @MessagePattern(DRUGS_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.deleteUsecase.execute(
      { id: data.id } as DrugDeleteInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }
}
