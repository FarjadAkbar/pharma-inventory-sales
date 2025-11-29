import { ILoggerAdapter } from '@/infra/logger';
import { UpdatedModel } from '@/infra/repository';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { DrugEntity, DrugEntitySchema, DrugApprovalStatusEnum } from '../entity/drug';
import { IDrugRepository } from '../repository/drug';

export const DrugUpdateSchema = DrugEntitySchema.pick({
  id: true,
  code: true,
  name: true,
  formula: true,
  strength: true,
  dosageForm: true,
  route: true,
  description: true
}).merge(
  InputValidator.object({
    approvalStatus: InputValidator.enum(DrugApprovalStatusEnum).optional()
  })
);

export class DrugUpdateUsecase implements IUsecase {
  constructor(
    private readonly drugRepository: IDrugRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(DrugUpdateSchema)
  async execute(input: DrugUpdateInput, { tracing, user }: ApiTrancingInput): Promise<DrugUpdateOutput> {
    const drugExists = await this.drugRepository.findById(input.id);

    if (!drugExists) {
      throw new ApiNotFoundException('drugNotFound');
    }

    const entity = new DrugEntity({
      ...drugExists,
      ...input
    });

    await this.drugRepository.updateOne({ id: input.id }, entity);

    this.loggerService.info({ message: 'drug updated successfully', obj: { drug: entity } });

    tracing.logEvent('drug-updated', `drug: ${entity.id} updated by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type DrugUpdateInput = Infer<typeof DrugUpdateSchema>;
export type DrugUpdateOutput = UpdatedModel;
