import { ILoggerAdapter } from '@pharma/infra/logger';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCSampleEntitySchema } from '../entity/qc-sample';
import { IQCSampleRepository } from '../repository/qc-sample';

export const QCSampleAssignSchema = QCSampleEntitySchema.pick({
  id: true
}).merge(
  InputValidator.object({
    userId: InputValidator.string().uuid()
  })
);

export class QCSampleAssignUsecase implements IUsecase {
  constructor(
    private readonly qcSampleRepository: IQCSampleRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(QCSampleAssignSchema)
  async execute(input: QCSampleAssignInput, { tracing, user }: ApiTrancingInput): Promise<QCSampleAssignOutput> {
    const sample = await this.qcSampleRepository.findById(input.id);

    if (!sample) {
      throw new ApiNotFoundException('qcSampleNotFound');
    }

    await this.qcSampleRepository.assign(input.id, input.userId);

    this.loggerService.info({ message: 'QC sample assigned', obj: { sampleId: input.id, userId: input.userId } });

    tracing.logEvent('qc-sample-assigned', `Sample: ${input.id} assigned to: ${input.userId} by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type QCSampleAssignInput = Infer<typeof QCSampleAssignSchema>;
export type QCSampleAssignOutput = { id: string; updated: boolean };
