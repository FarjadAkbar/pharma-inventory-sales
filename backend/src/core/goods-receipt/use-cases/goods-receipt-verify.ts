import { ILoggerAdapter } from '@/infra/logger';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException, ApiBadRequestException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer, InputValidator } from '@/utils/validator';
import { IPurchaseOrderRepository } from '@/core/purchase-order/repository/purchase-order';

import { GoodsReceiptEntitySchema, GoodsReceiptStatusEnum } from '../entity/goods-receipt';
import { IGoodsReceiptRepository } from '../repository/goods-receipt';

export const GoodsReceiptVerifySchema = GoodsReceiptEntitySchema.pick({
  id: true
});

export class GoodsReceiptVerifyUsecase implements IUsecase {
  constructor(
    private readonly goodsReceiptRepository: IGoodsReceiptRepository,
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(GoodsReceiptVerifySchema)
  async execute(input: GoodsReceiptVerifyInput, { tracing, user }: ApiTrancingInput): Promise<GoodsReceiptVerifyOutput> {
    const result = await this.goodsReceiptRepository.getWithItems(input.id);

    if (!result) {
      throw new ApiNotFoundException('goodsReceiptNotFound');
    }

    if (result.grn.status === GoodsReceiptStatusEnum.VERIFIED) {
      throw new ApiBadRequestException('goodsReceiptAlreadyVerified');
    }

    if (result.grn.status === GoodsReceiptStatusEnum.COMPLETED) {
      throw new ApiBadRequestException('goodsReceiptAlreadyCompleted');
    }

    await this.goodsReceiptRepository.verify(input.id);

    // Update PO status to Received
    await this.purchaseOrderRepository.receive(result.grn.purchaseOrderId);

    this.loggerService.info({ message: 'goods receipt verified', obj: { grnId: input.id } });

    tracing.logEvent('goods-receipt-verified', `GRN: ${input.id} verified by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type GoodsReceiptVerifyInput = Infer<typeof GoodsReceiptVerifySchema>;
export type GoodsReceiptVerifyOutput = { id: string; updated: boolean };
