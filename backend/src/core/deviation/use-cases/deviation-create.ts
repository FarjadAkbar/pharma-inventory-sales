import { ILoggerAdapter } from '@/infra/logger';
import { CreatedModel } from '@/infra/repository';
import { IEventAdapter } from '@/libs/event';
import { ValidateSchema } from '@/utils/decorators';
import { ApiConflictException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { UUIDUtils } from '@/utils/uuid';
import { Infer, InputValidator } from '@/utils/validator';

import { DeviationEntity, DeviationEntitySchema, DeviationStatusEnum } from '../entity/deviation';
import { IDeviationRepository } from '../repository/deviation';

export const DeviationCreateSchema = DeviationEntitySchema.pick({
  deviationNumber: true,
  title: true,
  description: true,
  severity: true,
  rootCause: true,
  correctiveActions: true
}).merge(
  InputValidator.object({
    status: InputValidator.enum(DeviationStatusEnum).optional().default(DeviationStatusEnum.OPEN)
  })
);

export class DeviationCreateUsecase implements IUsecase {
  constructor(
    private readonly deviationRepository: IDeviationRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(DeviationCreateSchema)
  async execute(input: DeviationCreateInput, { tracing, user }: ApiTrancingInput): Promise<DeviationCreateOutput> {
    const deviationExists = await this.deviationRepository.findByDeviationNumber(input.deviationNumber);

    if (deviationExists) {
      throw new ApiConflictException('deviationNumberExists');
    }

    const entity = new DeviationEntity({
      id: UUIDUtils.create(),
      deviationNumber: input.deviationNumber,
      title: input.title,
      description: input.description,
      severity: input.severity,
      status: input.status || DeviationStatusEnum.OPEN,
      rootCause: input.rootCause,
      correctiveActions: input.correctiveActions
    });

    const deviation = await this.deviationRepository.create(entity);

    this.loggerService.info({ message: 'Deviation created successfully', obj: { deviation } });

    tracing.logEvent('deviation-created', `Deviation: ${entity.deviationNumber} created by: ${user.email}`);

    return deviation;
  }
}

export type DeviationCreateInput = Infer<typeof DeviationCreateSchema>;
export type DeviationCreateOutput = CreatedModel;
