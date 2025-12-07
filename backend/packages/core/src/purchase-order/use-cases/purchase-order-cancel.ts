import { ILoggerAdapter } from '@pharma/infra/logger';
import { ValidateSchema } from '@pharma/utils/decorators';
import { ApiNotFoundException } from '@pharma/utils/exception';
import { ApiTrancingInput } from '@pharma/utils/request';
import { IUsecase } from '@pharma/utils/usecase';
import { Infer, InputValidator } from '@pharma/utils/validator';

import { PurchaseOrderEntitySchema } from '../entity/purchase-order';
import { IPurchaseOrderRepository } from '../repository/purchase-order';

export const PurchaseOrderCancelSchema = PurchaseOrderEntitySchema.pick({
  id: true
});

export class PurchaseOrderCancelUsecase implements IUsecase {
  constructor(
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(PurchaseOrderCancelSchema)
  async execute(input: PurchaseOrderCancelInput, { tracing, user }: ApiTrancingInput): Promise<PurchaseOrderCancelOutput> {
    const result = await this.purchaseOrderRepository.getWithItems(input.id);

    if (!result) {
      throw new ApiNotFoundException('purchaseOrderNotFound');
    }

    await this.purchaseOrderRepository.cancel(input.id);

    this.loggerService.info({ message: 'purchase order cancelled', obj: { poId: input.id } });

    tracing.logEvent('purchase-order-cancelled', `PO: ${input.id} cancelled by: ${user.email}`);

    return { id: input.id, updated: true };
  }
}

export type PurchaseOrderCancelInput = Infer<typeof PurchaseOrderCancelSchema>;
export type PurchaseOrderCancelOutput = { id: string; updated: boolean };
