import { ILoggerAdapter } from '@pharma/infra/logger';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { DeviationEntitySchema, DeviationStatusEnum } from '../entity/deviation';
import { IDeviationRepository } from '../repository/deviation';

export const DeviationUpdateSchema = DeviationEntitySchema.pick({
  id: true,
  title: true,
  description: true,
  severity: true,
  status: true,
  rootCause: true,
  correctiveActions: true
}).partial().required({ id: true });

export class DeviationUpdateUsecase implements IUsecase {
  constructor(
    private readonly deviationRepository: IDeviationRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(DeviationUpdateSchema)
  async execute(input: DeviationUpdateInput, { tracing, user }: ApiTrancingInput): Promise<DeviationUpdateOutput> {
    const deviation = await this.deviationRepository.findById(input.id);

    if (!deviation) {
      throw new ApiNotFoundException('deviationNotFound');
    }

    await this.deviationRepository.updateOne({ id: input.id }, input);

    this.loggerService.info({ message: 'Deviation updated', obj: { deviationId: input.id } });

    tracing.logEvent('deviation-updated', `Deviation: ${input.id} updated by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type DeviationUpdateInput = Infer<typeof DeviationUpdateSchema>;
export type DeviationUpdateOutput = { id: string; updated: boolean };
