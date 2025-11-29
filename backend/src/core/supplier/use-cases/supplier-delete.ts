import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { DeletedModel } from '@/utils/entity';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { SupplierEntitySchema } from '../entity/supplier';
import { ISupplierRepository } from '../repository/supplier';

export const SupplierDeleteSchema = SupplierEntitySchema.pick({
  id: true
});

export class SupplierDeleteUsecase implements IUsecase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  @ValidateSchema(SupplierDeleteSchema)
  async execute(input: SupplierDeleteInput, { tracing, user }: ApiTrancingInput): Promise<SupplierDeleteOutput> {
    const supplier = await this.supplierRepository.findById(input.id);

    if (!supplier) {
      throw new ApiNotFoundException('supplierNotFound');
    }

    await this.supplierRepository.softDelete({ id: input.id });

    tracing.logEvent('supplier-deleted', `supplier: ${input.id} deleted by: ${user.email}`);

    return { id: input.id, deleted: true };
  }
}

export type SupplierDeleteInput = Infer<typeof SupplierDeleteSchema>;
export type SupplierDeleteOutput = DeletedModel;
