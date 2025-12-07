import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { DeletedModel } from '@/utils/entity';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { PurchaseOrderEntitySchema } from '../entity/purchase-order';
import { IPurchaseOrderRepository } from '../repository/purchase-order';

export const PurchaseOrderDeleteSchema = PurchaseOrderEntitySchema.pick({
  id: true
});

export class PurchaseOrderDeleteUsecase implements IUsecase {
  constructor(private readonly purchaseOrderRepository: IPurchaseOrderRepository) {}

  @ValidateSchema(PurchaseOrderDeleteSchema)
  async execute(input: PurchaseOrderDeleteInput, { tracing, user }: ApiTrancingInput): Promise<PurchaseOrderDeleteOutput> {
    const result = await this.purchaseOrderRepository.getWithItems(input.id);

    if (!result) {
      throw new ApiNotFoundException('purchaseOrderNotFound');
    }

    await this.purchaseOrderRepository.softDelete({ id: input.id });

    tracing.logEvent('purchase-order-deleted', `PO: ${input.id} deleted by: ${user.email}`);

    return { id: input.id, deleted: true };
  }
}

export type PurchaseOrderDeleteInput = Infer<typeof PurchaseOrderDeleteSchema>;
export type PurchaseOrderDeleteOutput = DeletedModel;
