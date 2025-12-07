import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { PurchaseOrderEntity, PurchaseOrderEntitySchema, PurchaseOrderItemEntity } from '../entity/purchase-order';
import { IPurchaseOrderRepository } from '../repository/purchase-order';

export const PurchaseOrderGetByIdSchema = PurchaseOrderEntitySchema.pick({
  id: true
});

export class PurchaseOrderGetByIdUsecase implements IUsecase {
  constructor(private readonly purchaseOrderRepository: IPurchaseOrderRepository) {}

  @ValidateSchema(PurchaseOrderGetByIdSchema)
  async execute(input: PurchaseOrderGetByIdInput): Promise<PurchaseOrderGetByIdOutput> {
    const result = await this.purchaseOrderRepository.getWithItems(input.id);

    if (!result) {
      throw new ApiNotFoundException('purchaseOrderNotFound');
    }

    return result;
  }
}

export type PurchaseOrderGetByIdInput = Infer<typeof PurchaseOrderGetByIdSchema>;
export type PurchaseOrderGetByIdOutput = {
  po: PurchaseOrderEntity;
  items: PurchaseOrderItemEntity[];
};
