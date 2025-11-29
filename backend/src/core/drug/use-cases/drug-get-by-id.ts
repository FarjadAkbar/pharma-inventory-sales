import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { DrugEntity, DrugEntitySchema } from '../entity/drug';
import { IDrugRepository } from '../repository/drug';

export const DrugGetByIdSchema = DrugEntitySchema.pick({
  id: true
});

export class DrugGetByIdUsecase implements IUsecase {
  constructor(private readonly drugRepository: IDrugRepository) {}

  @ValidateSchema(DrugGetByIdSchema)
  async execute(input: DrugGetByIdInput): Promise<DrugGetByIdOutput> {
    const drug = await this.drugRepository.findById(input.id);

    if (!drug) {
      throw new ApiNotFoundException('drugNotFound');
    }

    return drug;
  }
}

export type DrugGetByIdInput = Infer<typeof DrugGetByIdSchema>;
export type DrugGetByIdOutput = DrugEntity;
