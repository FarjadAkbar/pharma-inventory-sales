import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { GoodsReceiptEntity, GoodsReceiptEntitySchema, GoodsReceiptItemEntity } from '../entity/goods-receipt';
import { IGoodsReceiptRepository } from '../repository/goods-receipt';

export const GoodsReceiptGetByIdSchema = GoodsReceiptEntitySchema.pick({
  id: true
});

export class GoodsReceiptGetByIdUsecase implements IUsecase {
  constructor(private readonly goodsReceiptRepository: IGoodsReceiptRepository) {}

  @ValidateSchema(GoodsReceiptGetByIdSchema)
  async execute(input: GoodsReceiptGetByIdInput): Promise<GoodsReceiptGetByIdOutput> {
    const result = await this.goodsReceiptRepository.getWithItems(input.id);

    if (!result) {
      throw new ApiNotFoundException('goodsReceiptNotFound');
    }

    return result;
  }
}

export type GoodsReceiptGetByIdInput = Infer<typeof GoodsReceiptGetByIdSchema>;
export type GoodsReceiptGetByIdOutput = {
  grn: GoodsReceiptEntity;
  items: GoodsReceiptItemEntity[];
};
