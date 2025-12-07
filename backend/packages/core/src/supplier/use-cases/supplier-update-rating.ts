import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { UpdatedEntity } from '@/utils/entity';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { SupplierEntitySchema } from '../entity/supplier';
import { ISupplierRepository } from '../repository/supplier';

export const SupplierUpdateRatingSchema = SupplierEntitySchema.pick({
  id: true
}).merge(
  InputValidator.object({
    rating: InputValidator.number().min(0).max(5)
  })
);

export class SupplierUpdateRatingUsecase implements IUsecase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  @ValidateSchema(SupplierUpdateRatingSchema)
  async execute(input: SupplierUpdateRatingInput): Promise<SupplierUpdateRatingOutput> {
    const supplier = await this.supplierRepository.findById(input.id);

    if (!supplier) {
      throw new ApiNotFoundException('supplierNotFound');
    }

    await this.supplierRepository.updateRating(input.id, input.rating);

    return { id: input.id, updated: true };
  }
}

export type SupplierUpdateRatingInput = Infer<typeof SupplierUpdateRatingSchema>;
export type SupplierUpdateRatingOutput = UpdatedEntity;
