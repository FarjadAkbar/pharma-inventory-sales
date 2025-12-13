import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { QC_RESULTS_CREATE, QC_RESULTS_DELETE, QC_RESULTS_GET_BY_ID, QC_RESULTS_LIST, QC_RESULTS_UPDATE } from '@pharma/utils';

import { QCResultCreateInput } from '@pharma/core/qc-result/use-cases/qc-result-create';
import { QCResultListInput } from '@pharma/core/qc-result/repository/qc-result';
import { ApiTrancingInput } from '@pharma/utils/request';

import { IQCResultCreateAdapter, IQCResultListAdapter } from './adapters';

@Controller()
export class QCResultsController {
  constructor(
    private readonly createUsecase: IQCResultCreateAdapter,
    private readonly listUsecase: IQCResultListAdapter
  ) {}

  @MessagePattern(QC_RESULTS_CREATE)
  async create(@Payload() data: { body?: QCResultCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as QCResultCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(QC_RESULTS_LIST)
  async list(@Payload() data: QCResultListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(QC_RESULTS_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, updated: false, message: 'UPDATE not yet implemented' };
  }

  @MessagePattern(QC_RESULTS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, message: 'GET_BY_ID not yet implemented' };
  }

  @MessagePattern(QC_RESULTS_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, deleted: false, message: 'DELETE not yet implemented' };
  }
}
