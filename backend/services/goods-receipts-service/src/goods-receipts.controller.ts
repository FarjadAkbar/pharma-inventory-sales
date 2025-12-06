import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  GOODS_RECEIPTS_CREATE,
  GOODS_RECEIPTS_DELETE,
  GOODS_RECEIPTS_GET_BY_ID,
  GOODS_RECEIPTS_LIST,
  GOODS_RECEIPTS_UPDATE
} from '@shared/constants/message-patterns';

import {
  IGoodsReceiptCreateAdapter,
  IGoodsReceiptDeleteAdapter,
  IGoodsReceiptGetByIdAdapter,
  IGoodsReceiptListAdapter,
  IGoodsReceiptVerifyAdapter
} from './adapters';

@Controller()
export class GoodsReceiptsController {
  constructor(
    private readonly createUsecase: IGoodsReceiptCreateAdapter,
    private readonly getByIdUsecase: IGoodsReceiptGetByIdAdapter,
    private readonly listUsecase: IGoodsReceiptListAdapter,
    private readonly verifyUsecase: IGoodsReceiptVerifyAdapter,
    private readonly deleteUsecase: IGoodsReceiptDeleteAdapter
  ) {}

  @MessagePattern(GOODS_RECEIPTS_CREATE)
  async create(@Payload() data: { body?: unknown; user?: unknown; tracing?: unknown }) {
    return this.createUsecase.execute(data.body as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(GOODS_RECEIPTS_UPDATE)
  async update(@Payload() data: { body?: unknown; id?: string; user?: unknown; tracing?: unknown }) {
    return this.verifyUsecase.execute({ id: data.id, ...data.body } as any, { user: data.user, tracing: data.tracing } as any);
  }

  @MessagePattern(GOODS_RECEIPTS_LIST)
  async list(@Payload() data: unknown) {
    return this.listUsecase.execute(data as any);
  }

  @MessagePattern(GOODS_RECEIPTS_GET_BY_ID)
  async getById(@Payload() data: { id?: string }) {
    return this.getByIdUsecase.execute(data as any);
  }

  @MessagePattern(GOODS_RECEIPTS_DELETE)
  async delete(@Payload() data: { id?: string; user?: unknown; tracing?: unknown }) {
    return this.deleteUsecase.execute({ id: data.id } as any, { user: data.user, tracing: data.tracing } as any);
  }
}
