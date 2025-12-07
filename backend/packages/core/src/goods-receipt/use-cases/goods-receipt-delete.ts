import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { DeletedModel } from '@pharma/utils/entity';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

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
