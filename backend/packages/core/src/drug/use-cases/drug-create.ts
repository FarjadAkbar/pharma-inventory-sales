import { ILoggerAdapter } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { IEventAdapter } from '@pharma/libs/event';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiConflictException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { UUIDUtils } from '@pharma/utils/uuid';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { DrugEntity, DrugEntitySchema, DrugApprovalStatusEnum } from '../entity/drug';
import { IDrugRepository } from '../repository/drug';

export const DrugCreateSchema = DrugEntitySchema.pick({
  code: true,
  name: true,
  formula: true,
  strength: true,
  dosageForm: true,
  route: true,
  description: true
}).merge(
  InputValidator.object({
    approvalStatus: InputValidator.enum(DrugApprovalStatusEnum).optional().default(DrugApprovalStatusEnum.DRAFT)
  })
);

export class DrugCreateUsecase implements IUsecase {
  constructor(
    private readonly drugRepository: IDrugRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(DrugCreateSchema)
  async execute(input: DrugCreateInput, { tracing, user }: ApiTrancingInput): Promise<DrugCreateOutput> {
    const entity = new DrugEntity({
      id: UUIDUtils.create(),
      code: input.code,
      name: input.name,
      formula: input.formula,
      strength: input.strength,
      dosageForm: input.dosageForm,
      route: input.route,
      description: input.description,
      approvalStatus: input.approvalStatus || DrugApprovalStatusEnum.DRAFT
    });

    const drugExists = await this.drugRepository.findByCode(entity.code);

    if (drugExists) {
      throw new ApiConflictException('drugExists');
    }

    const drug = await this.drugRepository.create(entity);

    this.loggerService.info({ message: 'drug created successfully', obj: { drug } });

    tracing.logEvent('drug-created', `drug: ${entity.code} created by: ${user.email}`);

    return drug;
  }
}

export type DrugCreateInput = Infer<typeof DrugCreateSchema>;
export type DrugCreateOutput = CreatedModel;
