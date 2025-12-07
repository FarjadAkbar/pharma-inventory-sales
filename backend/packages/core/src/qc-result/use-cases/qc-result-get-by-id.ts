import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCResultEntity, QCResultEntitySchema } from '../entity/qc-result';
import { IQCResultRepository } from '../repository/qc-result';

export const QCResultGetByIdSchema = QCResultEntitySchema.pick({
  id: true
});

export class QCResultGetByIdUsecase implements IUsecase {
  constructor(private readonly qcResultRepository: IQCResultRepository) {}

  @ValidateSchema(QCResultGetByIdSchema)
  async execute(input: QCResultGetByIdInput): Promise<QCResultGetByIdOutput> {
    const result = await this.qcResultRepository.findById(input.id);

    if (!result) {
      throw new ApiNotFoundException('qcResultNotFound');
    }

    return result;
  }
}

export type QCResultGetByIdInput = Infer<typeof QCResultGetByIdSchema>;
export type QCResultGetByIdOutput = QCResultEntity;
