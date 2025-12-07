import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import {
  RAW_MATERIALS_CREATE,
  RAW_MATERIALS_DELETE,
  RAW_MATERIALS_GET_BY_ID,
  RAW_MATERIALS_LIST,
  RAW_MATERIALS_UPDATE
} from '@pharma/utils/constants/message-patterns';

@Controller('raw-materials')
export class RawMaterialsController {
  constructor(@Inject('RAW_MATERIALS_SERVICE') private readonly rawMaterialsClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('raw-material:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.rawMaterialsClient.send(RAW_MATERIALS_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('raw-material:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.rawMaterialsClient.send(RAW_MATERIALS_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('raw-material:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.rawMaterialsClient.send(RAW_MATERIALS_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('raw-material:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.rawMaterialsClient.send(RAW_MATERIALS_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('raw-material:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.rawMaterialsClient.send(RAW_MATERIALS_DELETE, { id: params.id, user, tracing }));
  }
}
