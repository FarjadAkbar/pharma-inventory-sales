import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';
import {
  GOODS_RECEIPTS_CREATE,
  GOODS_RECEIPTS_DELETE,
  GOODS_RECEIPTS_GET_BY_ID,
  GOODS_RECEIPTS_LIST,
  GOODS_RECEIPTS_UPDATE
} from '@shared/constants/message-patterns';

@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(@Inject('GOODS_RECEIPTS_SERVICE') private readonly goodsReceiptsClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('goods-receipt:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.goodsReceiptsClient.send(GOODS_RECEIPTS_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('goods-receipt:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.goodsReceiptsClient.send(GOODS_RECEIPTS_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('goods-receipt:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.goodsReceiptsClient.send(GOODS_RECEIPTS_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('goods-receipt:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.goodsReceiptsClient.send(GOODS_RECEIPTS_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('goods-receipt:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.goodsReceiptsClient.send(GOODS_RECEIPTS_DELETE, { id: params.id, user, tracing }));
  }
}
