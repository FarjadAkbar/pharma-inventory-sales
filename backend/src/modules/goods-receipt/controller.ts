import { Controller, Delete, Get, HttpCode, Post, Req, Version } from '@nestjs/common';

import { GoodsReceiptCreateInput, GoodsReceiptCreateOutput } from '@/core/goods-receipt/use-cases/goods-receipt-create';
import { GoodsReceiptDeleteInput, GoodsReceiptDeleteOutput } from '@/core/goods-receipt/use-cases/goods-receipt-delete';
import { GoodsReceiptGetByIdInput, GoodsReceiptGetByIdOutput } from '@/core/goods-receipt/use-cases/goods-receipt-get-by-id';
import { GoodsReceiptListOutput } from '@/core/goods-receipt/use-cases/goods-receipt-list';
import { GoodsReceiptVerifyInput, GoodsReceiptVerifyOutput } from '@/core/goods-receipt/use-cases/goods-receipt-verify';
import { GoodsReceiptListInput } from '@/core/goods-receipt/repository/goods-receipt';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import {
  IGoodsReceiptCreateAdapter,
  IGoodsReceiptDeleteAdapter,
  IGoodsReceiptGetByIdAdapter,
  IGoodsReceiptListAdapter,
  IGoodsReceiptVerifyAdapter
} from './adapter';

@Controller('goods-receipts')
export class GoodsReceiptController {
  constructor(
    private readonly createUsecase: IGoodsReceiptCreateAdapter,
    private readonly getByIdUsecase: IGoodsReceiptGetByIdAdapter,
    private readonly listUsecase: IGoodsReceiptListAdapter,
    private readonly verifyUsecase: IGoodsReceiptVerifyAdapter,
    private readonly deleteUsecase: IGoodsReceiptDeleteAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('goods-receipt:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<GoodsReceiptCreateOutput> {
    return this.createUsecase.execute(body as GoodsReceiptCreateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('goods-receipt:list')
  async list(@Req() { query }: ApiRequest): Promise<GoodsReceiptListOutput> {
    const input: GoodsReceiptListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      status: query.status as 'Draft' | 'Verified' | 'Completed' | undefined,
      purchaseOrderId: query.purchaseOrderId as string | undefined
    };

    return await this.listUsecase.execute(input);
  }

  @Get(':id')
  @Version('1')
  @Permission('goods-receipt:getbyid')
  async getById(@Req() { params }: ApiRequest): Promise<GoodsReceiptGetByIdOutput> {
    return await this.getByIdUsecase.execute(params as GoodsReceiptGetByIdInput);
  }

  @Post(':id/verify')
  @Version('1')
  @Permission('goods-receipt:verify')
  async verify(@Req() { params, user, tracing }: ApiRequest): Promise<GoodsReceiptVerifyOutput> {
    return await this.verifyUsecase.execute({ id: params.id } as GoodsReceiptVerifyInput, { user, tracing });
  }

  @Delete(':id')
  @Version('1')
  @Permission('goods-receipt:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest): Promise<GoodsReceiptDeleteOutput> {
    return await this.deleteUsecase.execute(params as GoodsReceiptDeleteInput, { user, tracing });
  }
}
