import { ILoggerAdapter } from '@/infra/logger';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException, ApiBadRequestException } from '@/utils/exception';
import { UpdatedModel } from '@/infra/repository';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

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
export type DrugApproveOutput = UpdatedModel;
