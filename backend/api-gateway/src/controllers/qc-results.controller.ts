import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import { QC_RESULTS_CREATE, QC_RESULTS_DELETE, QC_RESULTS_GET_BY_ID, QC_RESULTS_LIST, QC_RESULTS_UPDATE } from '@pharma/utils';

@Controller('qc-results')
export class QCResultsController {
  constructor(@Inject('QC_RESULTS_SERVICE') private readonly qcResultsClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('qc-result:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.qcResultsClient.send(QC_RESULTS_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('qc-result:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.qcResultsClient.send(QC_RESULTS_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('qc-result:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.qcResultsClient.send(QC_RESULTS_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('qc-result:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.qcResultsClient.send(QC_RESULTS_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('qc-result:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.qcResultsClient.send(QC_RESULTS_DELETE, { id: params.id, user, tracing }));
  }
}
