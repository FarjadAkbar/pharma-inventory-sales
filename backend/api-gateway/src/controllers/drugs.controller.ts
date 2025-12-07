import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import { DRUGS_CREATE, DRUGS_DELETE, DRUGS_GET_BY_ID, DRUGS_LIST, DRUGS_UPDATE } from '@pharma/utils/constants/message-patterns';

@Controller('drugs')
export class DrugsController {
  constructor(@Inject('DRUGS_SERVICE') private readonly drugsClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('drug:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.drugsClient.send(DRUGS_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('drug:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.drugsClient.send(DRUGS_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('drug:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      approvalStatus: query.approvalStatus as 'Draft' | 'Pending' | 'Approved' | 'Rejected' | undefined
    };
    return firstValueFrom(this.drugsClient.send(DRUGS_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('drug:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.drugsClient.send(DRUGS_GET_BY_ID, params));
  }

  @Post(':id/approve')
  @Version('1')
  @Permission('drug:approve')
  async approve(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.drugsClient.send(DRUGS_UPDATE, { id: params.id, user, tracing, action: 'approve' }));
  }

  @Post(':id/reject')
  @Version('1')
  @Permission('drug:reject')
  async reject(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.drugsClient.send(DRUGS_UPDATE, { id: params.id, user, tracing, action: 'reject' }));
  }

  @Delete(':id')
  @Version('1')
  @Permission('drug:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.drugsClient.send(DRUGS_DELETE, { id: params.id, user, tracing }));
  }
}
