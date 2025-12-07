import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { DeletedModel } from '@pharma/utils/entity';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCTestEntitySchema } from '../entity/qc-test';
import { IQCTestRepository } from '../repository/qc-test';

export const QCTestDeleteSchema = QCTestEntitySchema.pick({
  id: true
});

export class QCTestDeleteUsecase implements IUsecase {
  constructor(private readonly qcTestRepository: IQCTestRepository) {}

  @ValidateSchema(QCTestDeleteSchema)
  async execute(input: QCTestDeleteInput, { tracing, user }: ApiTrancingInput): Promise<QCTestDeleteOutput> {
    const test = await this.qcTestRepository.findById(input.id);

    if (!test) {
      throw new ApiNotFoundException('qcTestNotFound');
    }

    await this.qcTestRepository.softDelete({ id: input.id });

    tracing.logEvent('qc-test-deleted', `Test: ${input.id} deleted by: ${user.email}`);

    return { id: input.id, deleted: true };
  }
}

export type QCTestDeleteInput = Infer<typeof QCTestDeleteSchema>;
export type QCTestDeleteOutput = DeletedModel;
