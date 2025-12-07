import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCTestEntity, QCTestEntitySchema } from '../entity/qc-test';
import { IQCTestRepository } from '../repository/qc-test';

export const QCTestGetByIdSchema = QCTestEntitySchema.pick({
  id: true
});

export class QCTestGetByIdUsecase implements IUsecase {
  constructor(private readonly qcTestRepository: IQCTestRepository) {}

  @ValidateSchema(QCTestGetByIdSchema)
  async execute(input: QCTestGetByIdInput): Promise<QCTestGetByIdOutput> {
    const test = await this.qcTestRepository.findById(input.id);

    if (!test) {
      throw new ApiNotFoundException('qcTestNotFound');
    }

    return test;
  }
}

export type QCTestGetByIdInput = Infer<typeof QCTestGetByIdSchema>;
export type QCTestGetByIdOutput = QCTestEntity;
