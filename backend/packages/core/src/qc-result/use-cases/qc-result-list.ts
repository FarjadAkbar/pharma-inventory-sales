import { ValidateSchema } from '@/utils/decorators';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { QCResultEntity } from '../entity/qc-result';
import { IQCResultRepository, QCResultListInput } from '../repository/qc-result';

export const QCResultListSchema = InputValidator.object({
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
  sampleId: InputValidator.string().uuid().optional(),
  testId: InputValidator.string().uuid().optional(),
  passed: InputValidator.boolean().optional()
});

export class QCResultListUsecase implements IUsecase {
  constructor(private readonly qcResultRepository: IQCResultRepository) {}

  @ValidateSchema(QCResultListSchema)
  async execute(input: QCResultListInput): Promise<QCResultListOutput> {
    const results = await this.qcResultRepository.list(input);

    return results;
  }
}

export type QCResultListOutput = {
  docs: QCResultEntity[];
  limit: number;
  page: number;
  total: number;
};
