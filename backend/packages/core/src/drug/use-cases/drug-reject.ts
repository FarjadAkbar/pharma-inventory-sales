import { ILoggerAdapter } from '@pharma/infra/logger';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { UpdatedEntity } from '@pharma/utils/entity';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { DrugEntitySchema } from '../entity/drug';
import { IDrugRepository } from '../repository/drug';

export const DrugRejectSchema = DrugEntitySchema.pick({
  id: true
});

export class DrugRejectUsecase implements IUsecase {
  constructor(
    private readonly drugRepository: IDrugRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(DrugRejectSchema)
  async execute(input: DrugRejectInput, { tracing, user }: ApiTrancingInput): Promise<DrugRejectOutput> {
    const drug = await this.drugRepository.findById(input.id);

    if (!drug) {
      throw new ApiNotFoundException('drugNotFound');
    }

    await this.drugRepository.reject(input.id);

    this.loggerService.info({ message: 'drug rejected successfully', obj: { drugId: input.id } });

    tracing.logEvent('drug-rejected', `drug: ${input.id} rejected by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type DrugRejectInput = Infer<typeof DrugRejectSchema>;
export type DrugRejectOutput = UpdatedEntity;
