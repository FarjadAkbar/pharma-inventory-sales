import { ValidateSchema } from '@pharma/utils/decorators';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { DeviationEntity } from '../entity/deviation';
import { IDeviationRepository, DeviationListInput } from '../repository/deviation';

export const DeviationListSchema = InputValidator.object({
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
  severity: InputValidator.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  status: InputValidator.enum(['Open', 'Investigating', 'Resolved', 'Closed']).optional()
});

export class DeviationListUsecase implements IUsecase {
  constructor(private readonly deviationRepository: IDeviationRepository) {}

  @ValidateSchema(DeviationListSchema)
  async execute(input: DeviationListInput): Promise<DeviationListOutput> {
    const deviations = await this.deviationRepository.list(input);

    return deviations;
  }
}

export type DeviationListOutput = {
  docs: DeviationEntity[];
  limit: number;
  page: number;
  total: number;
};
