import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { QC_SAMPLES_CREATE, QC_SAMPLES_DELETE, QC_SAMPLES_GET_BY_ID, QC_SAMPLES_LIST, QC_SAMPLES_UPDATE } from '@shared/constants/message-patterns';

import {
  IQCSampleCreateAdapter,
  IQCSampleListAdapter,
  IQCSampleAssignAdapter,
  IQCSampleCompleteAdapter
} from './adapters';

@Controller()
export class QCSamplesController {
  constructor(
    private readonly createUsecase: IQCSampleCreateAdapter,
    private readonly listUsecase: IQCSampleListAdapter,
    private readonly assignUsecase: IQCSampleAssignAdapter,
    private readonly completeUsecase: IQCSampleCompleteAdapter
  ) {}

  @MessagePattern(QC_SAMPLES_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(QC_SAMPLES_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(QC_SAMPLES_UPDATE)
  async update(@Payload() data: { id?: string; body?: unknown; user?: unknown; tracing?: unknown; action?: string }) {
    if (data.action === 'assign') {
      return this.assignUsecase.execute({ id: data.id, userId: data.body?.userId } as any, { user: data.user, tracing: data.tracing } as any);
    }
    if (data.action === 'complete') {
      return this.completeUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
    }
    return null;
  }

  @MessagePattern(QC_SAMPLES_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, message: 'GET_BY_ID not yet implemented' };
  }

  @MessagePattern(QC_SAMPLES_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, deleted: false, message: 'DELETE not yet implemented' };
  }
}
