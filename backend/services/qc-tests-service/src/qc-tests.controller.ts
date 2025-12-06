import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { QC_TESTS_CREATE, QC_TESTS_DELETE, QC_TESTS_GET_BY_ID, QC_TESTS_LIST, QC_TESTS_UPDATE } from '@/constants/message-patterns';

import { IQCTestCreateAdapter, IQCTestListAdapter } from './adapters';

@Controller()
export class QCTestsController {
  constructor(
    private readonly createUsecase: IQCTestCreateAdapter,
    private readonly listUsecase: IQCTestListAdapter
  ) {}

  @MessagePattern(QC_TESTS_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(QC_TESTS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(QC_TESTS_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: unknown; tracing?: unknown }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, updated: false, message: 'UPDATE not yet implemented' };
  }

  @MessagePattern(QC_TESTS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, message: 'GET_BY_ID not yet implemented' };
  }

  @MessagePattern(QC_TESTS_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, deleted: false, message: 'DELETE not yet implemented' };
  }
}
