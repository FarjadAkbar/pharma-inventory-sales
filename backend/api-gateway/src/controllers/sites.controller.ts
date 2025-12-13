import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import { SITES_CREATE, SITES_DELETE, SITES_GET_ALL, SITES_GET_BY_ID, SITES_LIST, SITES_UPDATE } from '@pharma/utils';

import { SiteEntity } from '@pharma/core/site/entity/site';

@Controller('sites')
export class SitesController {
  constructor(@Inject('SITES_SERVICE') private readonly sitesClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('site:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.sitesClient.send(SITES_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('site:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.sitesClient.send(SITES_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('site:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: (SearchHttpSchema.parse(query.search) as unknown as Partial<SiteEntity>) || null,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.sitesClient.send(SITES_LIST, input));
  }

  @Get('all')
  @Version('1')
  @Permission('site:getall')
  async getAll() {
    return firstValueFrom(this.sitesClient.send(SITES_GET_ALL, {}));
  }

  @Get(':id')
  @Version('1')
  @Permission('site:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.sitesClient.send(SITES_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('site:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.sitesClient.send(SITES_DELETE, { id: params.id, user, tracing }));
  }
}
