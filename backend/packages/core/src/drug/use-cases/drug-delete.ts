import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { DeletedModel } from '@pharma/utils/entity';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { DrugEntitySchema } from '../entity/drug';
import { IDrugRepository } from '../repository/drug';

export const DrugDeleteSchema = DrugEntitySchema.pick({
  id: true
});

export class DrugDeleteUsecase implements IUsecase {
  constructor(private readonly drugRepository: IDrugRepository) {}

  @ValidateSchema(DrugDeleteSchema)
  async execute(input: DrugDeleteInput, { tracing, user }: ApiTrancingInput): Promise<DrugDeleteOutput> {
    const drug = await this.drugRepository.findById(input.id);

    if (!drug) {
      throw new ApiNotFoundException('drugNotFound');
    }

    await this.drugRepository.softDelete({ id: input.id });

    tracing.logEvent('drug-deleted', `drug: ${input.id} deleted by: ${user.email}`);

    return { id: input.id, deleted: true };
  }
}

export type DrugDeleteInput = Infer<typeof DrugDeleteSchema>;
export type DrugDeleteOutput = DeletedModel;
