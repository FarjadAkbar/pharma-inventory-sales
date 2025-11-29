import { ILoggerAdapter } from '@/infra/logger';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { DeviationEntitySchema } from '../entity/deviation';
import { IDeviationRepository } from '../repository/deviation';

export const DeviationCloseSchema = DeviationEntitySchema.pick({
  id: true
});

export class DeviationCloseUsecase implements IUsecase {
  constructor(
    private readonly deviationRepository: IDeviationRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(DeviationCloseSchema)
  async execute(input: DeviationCloseInput, { tracing, user }: ApiTrancingInput): Promise<DeviationCloseOutput> {
    const deviation = await this.deviationRepository.findById(input.id);

    if (!deviation) {
      throw new ApiNotFoundException('deviationNotFound');
    }

    await this.deviationRepository.close(input.id);

    this.loggerService.info({ message: 'Deviation closed', obj: { deviationId: input.id } });

    tracing.logEvent('deviation-closed', `Deviation: ${input.id} closed by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type DeviationCloseInput = Infer<typeof DeviationCloseSchema>;
export type DeviationCloseOutput = { id: string; updated: boolean };
