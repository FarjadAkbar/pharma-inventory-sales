import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { DEVIATIONS_CREATE, DEVIATIONS_DELETE, DEVIATIONS_GET_BY_ID, DEVIATIONS_LIST, DEVIATIONS_UPDATE } from '@pharma/utils';

import { DeviationCreateInput } from '@pharma/core/deviation/use-cases/deviation-create';
import { DeviationUpdateInput } from '@pharma/core/deviation/use-cases/deviation-update';
import { DeviationCloseInput } from '@pharma/core/deviation/use-cases/deviation-close';
import { DeviationListInput } from '@pharma/core/deviation/repository/deviation';
import { ApiTrancingInput } from '@pharma/utils/request';

import { IDeviationCreateAdapter, IDeviationUpdateAdapter, IDeviationListAdapter, IDeviationCloseAdapter } from './adapters';

@Controller()
export class DeviationsController {
  constructor(
    private readonly createUsecase: IDeviationCreateAdapter,
    private readonly updateUsecase: IDeviationUpdateAdapter,
    private readonly listUsecase: IDeviationListAdapter,
    private readonly closeUsecase: IDeviationCloseAdapter
  ) {}

  @MessagePattern(DEVIATIONS_CREATE)
  async create(@Payload() data: { body?: DeviationCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as DeviationCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(DEVIATIONS_UPDATE)
  async update(@Payload() data: { body?: Partial<DeviationUpdateInput>; id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing']; action?: string }) {
    if (data.action === 'close') {
      return this.closeUsecase.execute(
        { id: data.id } as DeviationCloseInput,
        { user: data.user, tracing: data.tracing } as ApiTrancingInput
      );
    }
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.updateUsecase.execute(
      { ...body, id: data.id } as DeviationUpdateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(DEVIATIONS_LIST)
  async list(@Payload() data: DeviationListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(DEVIATIONS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, message: 'GET_BY_ID not yet implemented' };
  }

  @MessagePattern(DEVIATIONS_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, deleted: false, message: 'DELETE not yet implemented' };
  }
}
