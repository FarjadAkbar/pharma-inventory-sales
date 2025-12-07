import { ValidateSchema } from '@/utils/decorators';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { QCTestEntity } from '../entity/qc-test';
import { IQCTestRepository, QCTestListInput } from '../repository/qc-test';

export const QCTestListSchema = InputValidator.object({
  search: InputValidator.object({
    term: InputValidator.string().optional(),
    fields: InputValidator.array(InputValidator.string()).optional()
  }).optional(),
  sort: InputValidator.object({
    field: InputValidator.string(),
    order: InputValidator.enum(['asc', 'desc'])
  }).optional(),
  limit: InputValidator.number().min(1).max(100).optional(),
  page: InputValidator.number().min(1).optional(),
  materialType: InputValidator.string().optional()
});

export class QCTestListUsecase implements IUsecase {
  constructor(private readonly qcTestRepository: IQCTestRepository) {}

  @ValidateSchema(QCTestListSchema)
  async execute(input: QCTestListInput): Promise<QCTestListOutput> {
    const tests = await this.qcTestRepository.list(input);

    return tests;
  }
}

export type QCTestListOutput = {
  docs: QCTestEntity[];
  limit: number;
  page: number;
  total: number;
};
