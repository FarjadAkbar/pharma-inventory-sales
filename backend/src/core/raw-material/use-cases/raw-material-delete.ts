import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { DeletedModel } from '@/utils/entity';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { RawMaterialEntitySchema } from '../entity/raw-material';
import { IRawMaterialRepository } from '../repository/raw-material';

export const RawMaterialDeleteSchema = RawMaterialEntitySchema.pick({
  id: true
});

export class RawMaterialDeleteUsecase implements IUsecase {
  constructor(private readonly rawMaterialRepository: IRawMaterialRepository) {}

  @ValidateSchema(RawMaterialDeleteSchema)
  async execute(input: RawMaterialDeleteInput, { tracing, user }: ApiTrancingInput): Promise<RawMaterialDeleteOutput> {
    const rawMaterial = await this.rawMaterialRepository.findById(input.id);

    if (!rawMaterial) {
      throw new ApiNotFoundException('rawMaterialNotFound');
    }

    await this.rawMaterialRepository.softDelete({ id: input.id });

    tracing.logEvent('raw-material-deleted', `raw material: ${input.id} deleted by: ${user.email}`);

    return { id: input.id, deleted: true };
  }
}

export type RawMaterialDeleteInput = Infer<typeof RawMaterialDeleteSchema>;
export type RawMaterialDeleteOutput = DeletedModel;
