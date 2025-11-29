import { ILoggerAdapter } from '@/infra/logger';
import { UpdatedModel } from '@/infra/repository';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { RawMaterialEntity, RawMaterialEntitySchema } from '../entity/raw-material';
import { IRawMaterialRepository } from '../repository/raw-material';

export const RawMaterialUpdateSchema = RawMaterialEntitySchema.pick({
  id: true,
  code: true,
  name: true,
  grade: true,
  unitOfMeasure: true,
  supplierId: true,
  storageRequirements: true
});

export class RawMaterialUpdateUsecase implements IUsecase {
  constructor(
    private readonly rawMaterialRepository: IRawMaterialRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(RawMaterialUpdateSchema)
  async execute(input: RawMaterialUpdateInput, { tracing, user }: ApiTrancingInput): Promise<RawMaterialUpdateOutput> {
    const rawMaterialExists = await this.rawMaterialRepository.findById(input.id);

    if (!rawMaterialExists) {
      throw new ApiNotFoundException('rawMaterialNotFound');
    }

    const entity = new RawMaterialEntity({
      ...rawMaterialExists,
      ...input
    });

    await this.rawMaterialRepository.updateOne({ id: input.id }, entity);

    this.loggerService.info({ message: 'raw material updated successfully', obj: { rawMaterial: entity } });

    tracing.logEvent('raw-material-updated', `raw material: ${entity.id} updated by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type RawMaterialUpdateInput = Infer<typeof RawMaterialUpdateSchema>;
export type RawMaterialUpdateOutput = UpdatedModel;
