import { ValidateSchema } from '@/utils/decorators';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { QAReleaseEntity } from '../entity/qa-release';
import { IQAReleaseRepository, QAReleaseListInput } from '../repository/qa-release';

export const QAReleaseListSchema = InputValidator.object({
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
  decision: InputValidator.enum(['Release', 'Reject', 'Hold']).optional(),
  entityType: InputValidator.enum(['GoodsReceipt', 'Batch']).optional()
});

export class QAReleaseListUsecase implements IUsecase {
  constructor(private readonly qaReleaseRepository: IQAReleaseRepository) {}

  @ValidateSchema(QAReleaseListSchema)
  async execute(input: QAReleaseListInput): Promise<QAReleaseListOutput> {
    const releases = await this.qaReleaseRepository.list(input);

    return releases;
  }
}

export type QAReleaseListOutput = {
  docs: QAReleaseEntity[];
  limit: number;
  page: number;
  total: number;
};
