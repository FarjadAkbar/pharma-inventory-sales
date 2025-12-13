import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import { DEVIATIONS_CREATE, DEVIATIONS_DELETE, DEVIATIONS_GET_BY_ID, DEVIATIONS_LIST, DEVIATIONS_UPDATE } from '@pharma/utils';

@Controller('deviations')
export class DeviationsController {
  constructor(@Inject('DEVIATIONS_SERVICE') private readonly deviationsClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('deviation:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.deviationsClient.send(DEVIATIONS_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('deviation:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.deviationsClient.send(DEVIATIONS_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('deviation:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.deviationsClient.send(DEVIATIONS_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('deviation:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.deviationsClient.send(DEVIATIONS_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('deviation:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.deviationsClient.send(DEVIATIONS_DELETE, { id: params.id, user, tracing }));
  }
}
