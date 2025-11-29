import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

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
