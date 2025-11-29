import { ILoggerAdapter } from '@/infra/logger';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { QCSampleEntitySchema } from '../entity/qc-sample';
import { IQCSampleRepository } from '../repository/qc-sample';

export const QCSampleCompleteSchema = QCSampleEntitySchema.pick({
  id: true
});

export class QCSampleCompleteUsecase implements IUsecase {
  constructor(
    private readonly qcSampleRepository: IQCSampleRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(QCSampleCompleteSchema)
  async execute(input: QCSampleCompleteInput, { tracing, user }: ApiTrancingInput): Promise<QCSampleCompleteOutput> {
    const sample = await this.qcSampleRepository.findById(input.id);

    if (!sample) {
      throw new ApiNotFoundException('qcSampleNotFound');
    }

    await this.qcSampleRepository.complete(input.id);

    this.loggerService.info({ message: 'QC sample completed', obj: { sampleId: input.id } });

    tracing.logEvent('qc-sample-completed', `Sample: ${input.id} completed by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type QCSampleCompleteInput = Infer<typeof QCSampleCompleteSchema>;
export type QCSampleCompleteOutput = { id: string; updated: boolean };
