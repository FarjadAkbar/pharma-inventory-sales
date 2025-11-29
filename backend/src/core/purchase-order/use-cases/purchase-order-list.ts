import { ValidateSchema } from '@/utils/decorators';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { PurchaseOrderEntity } from '../entity/purchase-order';
import { IPurchaseOrderRepository, PurchaseOrderListInput } from '../repository/purchase-order';

export const PurchaseOrderListSchema = InputValidator.object({
  search: InputValidator.object({
    term: InputValidator.string().optional(),
    fields: InputValidator.array(InputValidator.string()).optional()
  }).optional(),
  sort: InputValidator.object({
    field: InputValidator.string(),
    order: InputValidator.enum(['asc', 'desc'])
  }).optional(),
  limit: InputValidator.number().min(1).max(100).optional(),
  page: InputValidator.number().min(1).optional(),
  status: InputValidator.enum(['Draft', 'Pending', 'Approved', 'Received', 'Cancelled']).optional(),
  supplierId: InputValidator.string().uuid().optional()
});

export class PurchaseOrderListUsecase implements IUsecase {
  constructor(private readonly purchaseOrderRepository: IPurchaseOrderRepository) {}

  @ValidateSchema(PurchaseOrderListSchema)
  async execute(input: PurchaseOrderListInput): Promise<PurchaseOrderListOutput> {
    const purchaseOrders = await this.purchaseOrderRepository.list(input);

    return purchaseOrders;
  }
}

export type PurchaseOrderListOutput = {
  docs: PurchaseOrderEntity[];
  limit: number;
  page: number;
  total: number;
};
