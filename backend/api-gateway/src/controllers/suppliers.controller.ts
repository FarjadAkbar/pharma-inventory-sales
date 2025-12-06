import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';
import {
  SUPPLIERS_CREATE,
  SUPPLIERS_DELETE,
  SUPPLIERS_GET_BY_ID,
  SUPPLIERS_LIST,
  SUPPLIERS_UPDATE
} from '@/constants/message-patterns';

@Controller('suppliers')
export class SuppliersController {
  constructor(@Inject('SUPPLIERS_SERVICE') private readonly suppliersClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('supplier:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.suppliersClient.send(SUPPLIERS_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('supplier:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.suppliersClient.send(SUPPLIERS_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('supplier:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      status: query.status as 'Active' | 'Inactive' | undefined
    };
    return firstValueFrom(this.suppliersClient.send(SUPPLIERS_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('supplier:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.suppliersClient.send(SUPPLIERS_GET_BY_ID, params));
  }

  @Put(':id/rating')
  @Version('1')
  @Permission('supplier:updaterating')
  async updateRating(@Req() { params, body }: ApiRequest) {
    return firstValueFrom(this.suppliersClient.send(SUPPLIERS_UPDATE, { id: params.id, ...body }));
  }

  @Delete(':id')
  @Version('1')
  @Permission('supplier:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.suppliersClient.send(SUPPLIERS_DELETE, { id: params.id, user, tracing }));
  }
}
