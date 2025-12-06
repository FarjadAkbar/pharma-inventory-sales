import { PurchaseOrderCreateInput, PurchaseOrderCreateOutput } from '@/core/purchase-order/use-cases/purchase-order-create';
import { PurchaseOrderDeleteInput, PurchaseOrderDeleteOutput } from '@/core/purchase-order/use-cases/purchase-order-delete';
import { PurchaseOrderGetByIdInput, PurchaseOrderGetByIdOutput } from '@/core/purchase-order/use-cases/purchase-order-get-by-id';
import { PurchaseOrderListOutput } from '@/core/purchase-order/use-cases/purchase-order-list';
import { PurchaseOrderApproveInput, PurchaseOrderApproveOutput } from '@/core/purchase-order/use-cases/purchase-order-approve';
import { PurchaseOrderCancelInput, PurchaseOrderCancelOutput } from '@/core/purchase-order/use-cases/purchase-order-cancel';
import { PurchaseOrderListInput } from '@/core/purchase-order/repository/purchase-order';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';

export abstract class IPurchaseOrderCreateAdapter implements IUsecase {
  abstract execute(input: PurchaseOrderCreateInput, trace: ApiTrancingInput): Promise<PurchaseOrderCreateOutput>;
}

export abstract class IPurchaseOrderGetByIdAdapter implements IUsecase {
  abstract execute(input: PurchaseOrderGetByIdInput): Promise<PurchaseOrderGetByIdOutput>;
}

export abstract class IPurchaseOrderListAdapter implements IUsecase {
  abstract execute(input: PurchaseOrderListInput): Promise<PurchaseOrderListOutput>;
}

export abstract class IPurchaseOrderApproveAdapter implements IUsecase {
  abstract execute(input: PurchaseOrderApproveInput, trace: ApiTrancingInput): Promise<PurchaseOrderApproveOutput>;
}

export abstract class IPurchaseOrderCancelAdapter implements IUsecase {
  abstract execute(input: PurchaseOrderCancelInput, trace: ApiTrancingInput): Promise<PurchaseOrderCancelOutput>;
}

export abstract class IPurchaseOrderDeleteAdapter implements IUsecase {
  abstract execute(input: PurchaseOrderDeleteInput, trace: ApiTrancingInput): Promise<PurchaseOrderDeleteOutput>;
}
