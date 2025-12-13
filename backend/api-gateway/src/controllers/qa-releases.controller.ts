import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import { QA_RELEASES_CREATE, QA_RELEASES_DELETE, QA_RELEASES_GET_BY_ID, QA_RELEASES_LIST, QA_RELEASES_UPDATE } from '@pharma/utils';

@Controller('qa-releases')
export class QAReleasesController {
  constructor(@Inject('QA_RELEASES_SERVICE') private readonly qaReleasesClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('qa-release:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.qaReleasesClient.send(QA_RELEASES_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('qa-release:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.qaReleasesClient.send(QA_RELEASES_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('qa-release:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.qaReleasesClient.send(QA_RELEASES_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('qa-release:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.qaReleasesClient.send(QA_RELEASES_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('qa-release:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.qaReleasesClient.send(QA_RELEASES_DELETE, { id: params.id, user, tracing }));
  }
}
