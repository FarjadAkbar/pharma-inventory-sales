import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { SupplierEntity, SupplierEntitySchema } from '../entity/supplier';
import { ISupplierRepository } from '../repository/supplier';

export const SupplierGetByIdSchema = SupplierEntitySchema.pick({
  id: true
});

export class SupplierGetByIdUsecase implements IUsecase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  @ValidateSchema(SupplierGetByIdSchema)
  async execute(input: SupplierGetByIdInput): Promise<SupplierGetByIdOutput> {
    const supplier = await this.supplierRepository.findById(input.id);

    if (!supplier) {
      throw new ApiNotFoundException('supplierNotFound');
    }

    return supplier;
  }
}

export type SupplierGetByIdInput = Infer<typeof SupplierGetByIdSchema>;
export type SupplierGetByIdOutput = SupplierEntity;
