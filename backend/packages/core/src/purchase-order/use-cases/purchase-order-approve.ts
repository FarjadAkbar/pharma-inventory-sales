import { ILoggerAdapter } from '@pharma/infra/logger';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException, ApiBadRequestException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { PurchaseOrderEntitySchema, PurchaseOrderStatusEnum } from '../entity/purchase-order';
import { IPurchaseOrderRepository } from '../repository/purchase-order';

export const PurchaseOrderApproveSchema = PurchaseOrderEntitySchema.pick({
  id: true
});

export class PurchaseOrderApproveUsecase implements IUsecase {
  constructor(
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(PurchaseOrderApproveSchema)
  async execute(input: PurchaseOrderApproveInput, { tracing, user }: ApiTrancingInput): Promise<PurchaseOrderApproveOutput> {
    const result = await this.purchaseOrderRepository.getWithItems(input.id);

    if (!result) {
      throw new ApiNotFoundException('purchaseOrderNotFound');
    }

    if (result.po.status === PurchaseOrderStatusEnum.APPROVED) {
      throw new ApiBadRequestException('purchaseOrderAlreadyApproved');
    }

    if (result.po.status === PurchaseOrderStatusEnum.CANCELLED) {
      throw new ApiBadRequestException('cannotApproveCancelledPO');
    }

    await this.purchaseOrderRepository.approve(input.id);

    this.loggerService.info({ message: 'purchase order approved', obj: { poId: input.id } });

    tracing.logEvent('purchase-order-approved', `PO: ${input.id} approved by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type PurchaseOrderApproveInput = Infer<typeof PurchaseOrderApproveSchema>;
export type PurchaseOrderApproveOutput = { id: string; updated: boolean };
