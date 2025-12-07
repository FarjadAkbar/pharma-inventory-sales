import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { DeletedModel } from '@/utils/entity';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';

import { GoodsReceiptEntitySchema } from '../entity/goods-receipt';
import { IGoodsReceiptRepository } from '../repository/goods-receipt';

export const GoodsReceiptDeleteSchema = GoodsReceiptEntitySchema.pick({
  id: true
});

export class GoodsReceiptDeleteUsecase implements IUsecase {
  constructor(private readonly goodsReceiptRepository: IGoodsReceiptRepository) {}

  @ValidateSchema(GoodsReceiptDeleteSchema)
  async execute(input: GoodsReceiptDeleteInput, { tracing, user }: ApiTrancingInput): Promise<GoodsReceiptDeleteOutput> {
    const result = await this.goodsReceiptRepository.getWithItems(input.id);

    if (!result) {
      throw new ApiNotFoundException('goodsReceiptNotFound');
    }

    await this.goodsReceiptRepository.softDelete({ id: input.id });

    tracing.logEvent('goods-receipt-deleted', `GRN: ${input.id} deleted by: ${user.email}`);

    return { id: input.id, deleted: true };
  }
}

export type GoodsReceiptDeleteInput = Infer<typeof GoodsReceiptDeleteSchema>;
export type GoodsReceiptDeleteOutput = DeletedModel;
