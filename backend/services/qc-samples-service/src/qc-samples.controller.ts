import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { QC_SAMPLES_CREATE, QC_SAMPLES_DELETE, QC_SAMPLES_GET_BY_ID, QC_SAMPLES_LIST, QC_SAMPLES_UPDATE } from '@pharma/utils/constants/message-patterns';

import { QCSampleCreateInput } from '@pharma/core/qc-sample/use-cases/qc-sample-create';
import { QCSampleListInput } from '@pharma/core/qc-sample/repository/qc-sample';
import { QCSampleAssignInput } from '@pharma/core/qc-sample/use-cases/qc-sample-assign';
import { QCSampleCompleteInput } from '@pharma/core/qc-sample/use-cases/qc-sample-complete';
import { ApiTrancingInput } from '@pharma/utils/request';

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
  async create(@Payload() data: { body?: QCSampleCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as QCSampleCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(QC_SAMPLES_LIST)
  async list(@Payload() data: QCSampleListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(QC_SAMPLES_UPDATE)
  async update(@Payload() data: { id?: string; body?: Partial<QCSampleAssignInput>; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing']; action?: string }) {
    if (data.action === 'assign') {
      const body = (data.body ?? {}) as Record<string, unknown>;
      return this.assignUsecase.execute(
        { id: data.id, ...body } as QCSampleAssignInput,
        { user: data.user, tracing: data.tracing } as ApiTrancingInput
      );
    }
    if (data.action === 'complete') {
      return this.completeUsecase.execute(
        { id: data.id } as QCSampleCompleteInput,
        { user: data.user, tracing: data.tracing } as ApiTrancingInput
      );
    }
    return null;
  }

  @MessagePattern(QC_SAMPLES_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, message: 'GET_BY_ID not yet implemented' };
  }

  @MessagePattern(QC_SAMPLES_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    // Stub implementation - can be implemented later if needed
    return { id: data.id, deleted: false, message: 'DELETE not yet implemented' };
  }
}
