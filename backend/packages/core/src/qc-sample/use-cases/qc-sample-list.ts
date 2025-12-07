import { ValidateSchema } from '@pharma/utils/decorators';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { QCSampleEntity } from '../entity/qc-sample';
import { IQCSampleRepository, QCSampleListInput } from '../repository/qc-sample';

export const QCSampleListSchema = InputValidator.object({
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
  status: InputValidator.enum(['Pending', 'InProgress', 'Completed', 'Failed']).optional(),
  priority: InputValidator.enum(['Low', 'Medium', 'High']).optional(),
  assignedTo: InputValidator.string().uuid().optional()
});

export class QCSampleListUsecase implements IUsecase {
  constructor(private readonly qcSampleRepository: IQCSampleRepository) {}

  @ValidateSchema(QCSampleListSchema)
  async execute(input: QCSampleListInput): Promise<QCSampleListOutput> {
    const samples = await this.qcSampleRepository.list(input);

    return samples;
  }
}

export type QCSampleListOutput = {
  docs: QCSampleEntity[];
  limit: number;
  page: number;
  total: number;
};
