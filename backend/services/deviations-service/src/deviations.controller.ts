import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { DEVIATIONS_CREATE, DEVIATIONS_DELETE, DEVIATIONS_GET_BY_ID, DEVIATIONS_LIST, DEVIATIONS_UPDATE } from '@shared/constants/message-patterns';

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
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(DEVIATIONS_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: unknown; tracing?: unknown; action?: string }) {
    if (data.action === 'close') {
      return this.closeUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
    }
    return this.updateUsecase.execute({ ...data.body, id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(DEVIATIONS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(DEVIATIONS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, message: 'GET_BY_ID not yet implemented' };
  }

  @MessagePattern(DEVIATIONS_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, deleted: false, message: 'DELETE not yet implemented' };
  }
}
