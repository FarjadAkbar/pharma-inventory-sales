import { ValidateSchema } from '@/utils/decorators';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { DrugEntity } from '../entity/drug';
import { IDrugRepository, DrugListInput } from '../repository/drug';

export const DrugListSchema = InputValidator.object({
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
  approvalStatus: InputValidator.enum(['Draft', 'Pending', 'Approved', 'Rejected']).optional()
});

export class DrugListUsecase implements IUsecase {
  constructor(private readonly drugRepository: IDrugRepository) {}

  @ValidateSchema(DrugListSchema)
  async execute(input: DrugListInput): Promise<DrugListOutput> {
    const drugs = await this.drugRepository.list(input);

    return drugs;
  }
}

export type DrugListOutput = {
  docs: DrugEntity[];
  limit: number;
  page: number;
  total: number;
};
