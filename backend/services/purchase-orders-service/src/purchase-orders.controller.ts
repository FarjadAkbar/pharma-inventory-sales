import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  PURCHASE_ORDERS_CREATE,
  PURCHASE_ORDERS_DELETE,
  PURCHASE_ORDERS_GET_BY_ID,
  PURCHASE_ORDERS_LIST,
  PURCHASE_ORDERS_UPDATE
} from '@shared/constants/message-patterns';

import {
  IPurchaseOrderCreateAdapter,
  IPurchaseOrderDeleteAdapter,
  IPurchaseOrderGetByIdAdapter,
  IPurchaseOrderListAdapter,
  IPurchaseOrderApproveAdapter,
  IPurchaseOrderCancelAdapter
} from './adapters';

@Controller()
export class PurchaseOrdersController {
  constructor(
    private readonly createUsecase: IPurchaseOrderCreateAdapter,
    private readonly getByIdUsecase: IPurchaseOrderGetByIdAdapter,
    private readonly listUsecase: IPurchaseOrderListAdapter,
    private readonly approveUsecase: IPurchaseOrderApproveAdapter,
    private readonly cancelUsecase: IPurchaseOrderCancelAdapter,
    private readonly deleteUsecase: IPurchaseOrderDeleteAdapter
  ) {}

  @MessagePattern(PURCHASE_ORDERS_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(PURCHASE_ORDERS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(PURCHASE_ORDERS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(PURCHASE_ORDERS_UPDATE)
  async update(@Payload() data: { id?: string; user?: unknown; tracing?: unknown; action?: string }) {
    if (data.action === 'approve') {
      return this.approveUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
    }
    if (data.action === 'cancel') {
      return this.cancelUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
    }
    return null;
  }

  @MessagePattern(PURCHASE_ORDERS_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    return this.deleteUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }
}
