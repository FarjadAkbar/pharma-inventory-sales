import { ILoggerAdapter } from '@pharma/infra/logger';
import { CreatedModel } from '@pharma/infra/repository';
import { IEventAdapter } from '@pharma/libs/event';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiConflictException, ApiNotFoundException, ApiBadRequestException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { UUIDUtils } from '@pharma/utils/uuid';
import { Infer, InputValidator } from '@pharma/utils/validator';
import { IPurchaseOrderRepository } from '../../purchase-order/repository/purchase-order';
import { PurchaseOrderStatusEnum } from '../../purchase-order/entity/purchase-order';

import { GoodsReceiptEntity, GoodsReceiptEntitySchema, GoodsReceiptStatusEnum, GoodsReceiptItemEntity, GoodsReceiptItemEntitySchema } from '../entity/goods-receipt';
import { IGoodsReceiptRepository } from '../repository/goods-receipt';

const GRNItemSchema = GoodsReceiptItemEntitySchema.pick({
  purchaseOrderItemId: true,
  receivedQuantity: true,
  acceptedQuantity: true,
  rejectedQuantity: true,
  batchNumber: true,
  expiryDate: true
});

export const GoodsReceiptCreateSchema = GoodsReceiptEntitySchema.pick({
  grnNumber: true,
  purchaseOrderId: true,
  receivedDate: true,
  remarks: true
}).merge(
  InputValidator.object({
    items: InputValidator.array(GRNItemSchema).min(1),
    status: InputValidator.enum(GoodsReceiptStatusEnum).optional().default(GoodsReceiptStatusEnum.DRAFT)
  })
);

export class GoodsReceiptCreateUsecase implements IUsecase {
  constructor(
    private readonly goodsReceiptRepository: IGoodsReceiptRepository,
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter
  ) {}

  @ValidateSchema(GoodsReceiptCreateSchema)
  async execute(input: GoodsReceiptCreateInput, { tracing, user }: ApiTrancingInput): Promise<GoodsReceiptCreateOutput> {
    // Verify PO exists and is approved
    const poResult = await this.purchaseOrderRepository.getWithItems(input.purchaseOrderId);
    if (!poResult) {
      throw new ApiNotFoundException('purchaseOrderNotFound');
    }

    if (poResult.po.status !== PurchaseOrderStatusEnum.APPROVED) {
      throw new ApiBadRequestException('purchaseOrderNotApproved');
    }

    // Check GRN number uniqueness
    const grnExists = await this.goodsReceiptRepository.findByGRNNumber(input.grnNumber);
    if (grnExists) {
      throw new ApiConflictException('grnNumberExists');
    }

    // Validate received quantities don't exceed ordered quantities
    for (const item of input.items) {
      const poItem = poResult.items.find((pi) => pi.id === item.purchaseOrderItemId);
      if (!poItem) {
        throw new ApiNotFoundException(`poItemNotFound: ${item.purchaseOrderItemId}`);
      }

      if (item.receivedQuantity > poItem.quantity) {
        throw new ApiBadRequestException(`receivedQuantityExceedsOrdered: ${item.purchaseOrderItemId}`);
      }

      if (item.acceptedQuantity + item.rejectedQuantity !== item.receivedQuantity) {
        throw new ApiBadRequestException(`quantityMismatch: ${item.purchaseOrderItemId}`);
      }
    }

    const grnEntity = new GoodsReceiptEntity({
      id: UUIDUtils.create(),
      grnNumber: input.grnNumber,
      purchaseOrderId: input.purchaseOrderId,
      receivedDate: input.receivedDate,
      status: input.status || GoodsReceiptStatusEnum.DRAFT,
      remarks: input.remarks
    });

    const itemEntities = input.items.map((item) =>
      new GoodsReceiptItemEntity({
        id: UUIDUtils.create(),
        goodsReceiptId: grnEntity.id,
        purchaseOrderItemId: item.purchaseOrderItemId,
        receivedQuantity: item.receivedQuantity,
        acceptedQuantity: item.acceptedQuantity,
        rejectedQuantity: item.rejectedQuantity,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate
      })
    );

    const result = await this.goodsReceiptRepository.createWithItems(grnEntity, itemEntities);

    this.loggerService.info({ message: 'goods receipt created successfully', obj: { grn: grnEntity } });

    tracing.logEvent('goods-receipt-created', `GRN: ${grnEntity.grnNumber} created by: ${user.email}`);

    return result;
  }
}

export type GoodsReceiptCreateInput = Infer<typeof GoodsReceiptCreateSchema>;
export type GoodsReceiptCreateOutput = CreatedModel;
