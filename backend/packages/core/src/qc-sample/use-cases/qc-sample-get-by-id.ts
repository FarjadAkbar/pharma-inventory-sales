import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCSampleEntity, QCSampleEntitySchema } from '../entity/qc-sample';
import { IQCSampleRepository } from '../repository/qc-sample';

export const QCSampleGetByIdSchema = QCSampleEntitySchema.pick({
  id: true
});

export class QCSampleGetByIdUsecase implements IUsecase {
  constructor(private readonly qcSampleRepository: IQCSampleRepository) {}

  @ValidateSchema(QCSampleGetByIdSchema)
  async execute(input: QCSampleGetByIdInput): Promise<QCSampleGetByIdOutput> {
    const sample = await this.qcSampleRepository.findById(input.id);

    if (!sample) {
      throw new ApiNotFoundException('qcSampleNotFound');
    }

    return sample;
  }
}

export type QCSampleGetByIdInput = Infer<typeof QCSampleGetByIdSchema>;
export type QCSampleGetByIdOutput = QCSampleEntity;
