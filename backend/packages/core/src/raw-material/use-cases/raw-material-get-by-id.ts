import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { RawMaterialEntity, RawMaterialEntitySchema } from '../entity/raw-material';
import { IRawMaterialRepository } from '../repository/raw-material';

export const RawMaterialGetByIdSchema = RawMaterialEntitySchema.pick({
  id: true
});

export class RawMaterialGetByIdUsecase implements IUsecase {
  constructor(private readonly rawMaterialRepository: IRawMaterialRepository) {}

  @ValidateSchema(RawMaterialGetByIdSchema)
  async execute(input: RawMaterialGetByIdInput): Promise<RawMaterialGetByIdOutput> {
    const rawMaterial = await this.rawMaterialRepository.findById(input.id);

    if (!rawMaterial) {
      throw new ApiNotFoundException('rawMaterialNotFound');
    }

    return rawMaterial;
  }
}

export type RawMaterialGetByIdInput = Infer<typeof RawMaterialGetByIdSchema>;
export type RawMaterialGetByIdOutput = RawMaterialEntity;
