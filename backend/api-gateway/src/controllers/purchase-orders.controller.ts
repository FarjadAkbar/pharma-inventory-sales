import { Controller, Delete, Get, HttpCode, Post, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';
import {
  PURCHASE_ORDERS_CREATE,
  PURCHASE_ORDERS_DELETE,
  PURCHASE_ORDERS_GET_BY_ID,
  PURCHASE_ORDERS_LIST,
  PURCHASE_ORDERS_UPDATE
} from '@/constants/message-patterns';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(@Inject('PURCHASE_ORDERS_SERVICE') private readonly purchaseOrdersClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('purchase-order:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.purchaseOrdersClient.send(PURCHASE_ORDERS_CREATE, { ...body, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('purchase-order:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      status: query.status as 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled' | undefined,
      supplierId: query.supplierId as string | undefined
    };
    return firstValueFrom(this.purchaseOrdersClient.send(PURCHASE_ORDERS_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('purchase-order:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.purchaseOrdersClient.send(PURCHASE_ORDERS_GET_BY_ID, params));
  }

  @Post(':id/approve')
  @Version('1')
  @Permission('purchase-order:approve')
  async approve(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.purchaseOrdersClient.send(PURCHASE_ORDERS_UPDATE, { id: params.id, user, tracing, action: 'approve' }));
  }

  @Post(':id/cancel')
  @Version('1')
  @Permission('purchase-order:cancel')
  async cancel(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.purchaseOrdersClient.send(PURCHASE_ORDERS_UPDATE, { id: params.id, user, tracing, action: 'cancel' }));
  }

  @Delete(':id')
  @Version('1')
  @Permission('purchase-order:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.purchaseOrdersClient.send(PURCHASE_ORDERS_DELETE, { id: params.id, user, tracing }));
  }
}
