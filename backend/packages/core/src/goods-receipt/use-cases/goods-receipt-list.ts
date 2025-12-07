import { ValidateSchema } from '@pharma/utils/decorators';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { GoodsReceiptEntity } from '../entity/goods-receipt';
import { IGoodsReceiptRepository, GoodsReceiptListInput } from '../repository/goods-receipt';

export const GoodsReceiptListSchema = InputValidator.object({
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
  status: InputValidator.enum(['Draft', 'Verified', 'Completed']).optional(),
  purchaseOrderId: InputValidator.string().uuid().optional()
});

export class GoodsReceiptListUsecase implements IUsecase {
  constructor(private readonly goodsReceiptRepository: IGoodsReceiptRepository) {}

  @ValidateSchema(GoodsReceiptListSchema)
  async execute(input: GoodsReceiptListInput): Promise<GoodsReceiptListOutput> {
    const goodsReceipts = await this.goodsReceiptRepository.list(input);

    return goodsReceipts;
  }
}

export type GoodsReceiptListOutput = {
  docs: GoodsReceiptEntity[];
  limit: number;
  page: number;
  total: number;
};
