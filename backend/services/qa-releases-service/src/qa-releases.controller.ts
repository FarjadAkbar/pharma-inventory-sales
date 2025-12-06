import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { QA_RELEASES_CREATE, QA_RELEASES_DELETE, QA_RELEASES_GET_BY_ID, QA_RELEASES_LIST, QA_RELEASES_UPDATE } from '@shared/constants/message-patterns';

import { IQAReleaseCreateAdapter, IQAReleaseListAdapter } from './adapters';

@Controller()
export class QAReleasesController {
  constructor(
    private readonly createUsecase: IQAReleaseCreateAdapter,
    private readonly listUsecase: IQAReleaseListAdapter
  ) {}

  @MessagePattern(QA_RELEASES_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(QA_RELEASES_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(QA_RELEASES_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: unknown; tracing?: unknown }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, updated: false, message: 'UPDATE not yet implemented' };
  }

  @MessagePattern(QA_RELEASES_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, message: 'GET_BY_ID not yet implemented' };
  }

  @MessagePattern(QA_RELEASES_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, deleted: false, message: 'DELETE not yet implemented' };
  }
}
