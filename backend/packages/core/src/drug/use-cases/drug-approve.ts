import { ILoggerAdapter } from '@pharma/infra/logger';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException, ApiBadRequestException } from '@pharma/utils/exception';
import { UpdatedEntity } from '@pharma/utils/entity';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { DrugEntitySchema, DrugApprovalStatusEnum } from '../entity/drug';
import { IDrugRepository } from '../repository/drug';

export const DrugApproveSchema = DrugEntitySchema.pick({
  id: true
});

export class DrugApproveUsecase implements IUsecase {
  constructor(
    private readonly drugRepository: IDrugRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(DrugApproveSchema)
  async execute(input: DrugApproveInput, { tracing, user }: ApiTrancingInput): Promise<DrugApproveOutput> {
    const drug = await this.drugRepository.findById(input.id);

    if (!drug) {
      throw new ApiNotFoundException('drugNotFound');
    }

    if (drug.approvalStatus === DrugApprovalStatusEnum.APPROVED) {
      throw new ApiBadRequestException('drugAlreadyApproved');
    }

    await this.drugRepository.approve(input.id);

    this.loggerService.info({ message: 'drug approved successfully', obj: { drugId: input.id } });

    tracing.logEvent('drug-approved', `drug: ${input.id} approved by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type DrugApproveInput = Infer<typeof DrugApproveSchema>;
export type DrugApproveOutput = UpdatedEntity;
