import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  GOODS_RECEIPTS_CREATE,
  GOODS_RECEIPTS_DELETE,
  GOODS_RECEIPTS_GET_BY_ID,
  GOODS_RECEIPTS_LIST,
  GOODS_RECEIPTS_UPDATE
} from '@pharma/utils';

import { GoodsReceiptCreateInput } from '@pharma/core/goods-receipt/use-cases/goods-receipt-create';
import { GoodsReceiptVerifyInput } from '@pharma/core/goods-receipt/use-cases/goods-receipt-verify';
import { GoodsReceiptDeleteInput } from '@pharma/core/goods-receipt/use-cases/goods-receipt-delete';
import { GoodsReceiptGetByIdInput } from '@pharma/core/goods-receipt/use-cases/goods-receipt-get-by-id';
import { GoodsReceiptListInput } from '@pharma/core/goods-receipt/repository/goods-receipt';
import { ApiTrancingInput } from '@pharma/utils/request';

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
  async create(@Payload() data: { body?: GoodsReceiptCreateInput; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.createUsecase.execute(
      data.body as GoodsReceiptCreateInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(GOODS_RECEIPTS_UPDATE)
  async update(@Payload() data: { body?: Partial<GoodsReceiptVerifyInput>; id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    const body = (data.body ?? {}) as Record<string, unknown>;
    return this.verifyUsecase.execute(
      { id: data.id, ...body } as GoodsReceiptVerifyInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }

  @MessagePattern(GOODS_RECEIPTS_LIST)
  async list(@Payload() data: GoodsReceiptListInput) {
    return this.listUsecase.execute(data);
  }

  @MessagePattern(GOODS_RECEIPTS_GET_BY_ID)
  async getById(@Payload() data: GoodsReceiptGetByIdInput) {
    return this.getByIdUsecase.execute(data);
  }

  @MessagePattern(GOODS_RECEIPTS_DELETE)
  async delete(@Payload() data: { id?: string; user?: ApiTrancingInput['user']; tracing?: ApiTrancingInput['tracing'] }) {
    return this.deleteUsecase.execute(
      { id: data.id } as GoodsReceiptDeleteInput,
      { user: data.user, tracing: data.tracing } as ApiTrancingInput
    );
  }
}
