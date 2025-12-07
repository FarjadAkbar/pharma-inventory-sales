import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import { QC_SAMPLES_CREATE, QC_SAMPLES_DELETE, QC_SAMPLES_GET_BY_ID, QC_SAMPLES_LIST, QC_SAMPLES_UPDATE } from '@pharma/utils/constants/message-patterns';

@Controller('qc-samples')
export class QCSamplesController {
  constructor(@Inject('QC_SAMPLES_SERVICE') private readonly qcSamplesClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('qc-sample:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.qcSamplesClient.send(QC_SAMPLES_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('qc-sample:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.qcSamplesClient.send(QC_SAMPLES_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('qc-sample:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.qcSamplesClient.send(QC_SAMPLES_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('qc-sample:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.qcSamplesClient.send(QC_SAMPLES_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('qc-sample:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.qcSamplesClient.send(QC_SAMPLES_DELETE, { id: params.id, user, tracing }));
  }
}
