import { ILoggerAdapter } from '@/infra/logger';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { UpdatedEntity } from '@/utils/entity';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

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
