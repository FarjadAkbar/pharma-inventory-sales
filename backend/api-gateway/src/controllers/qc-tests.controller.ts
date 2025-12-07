import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Permission } from '@pharma/utils/decorators';
import { ApiRequest } from '@pharma/utils/request';
import { SearchHttpSchema } from '@pharma/utils/search';
import { SortHttpSchema } from '@pharma/utils/sort';
import { QC_TESTS_CREATE, QC_TESTS_DELETE, QC_TESTS_GET_BY_ID, QC_TESTS_LIST, QC_TESTS_UPDATE } from '@pharma/utils/constants/message-patterns';

@Controller('qc-tests')
export class QCTestsController {
  constructor(@Inject('QC_TESTS_SERVICE') private readonly qcTestsClient: ClientProxy) {}

  @Post()
  @Version('1')
  @Permission('qc-test:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest) {
    return firstValueFrom(this.qcTestsClient.send(QC_TESTS_CREATE, { ...body, user, tracing }));
  }

  @Put(':id')
  @Version('1')
  @Permission('qc-test:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest) {
    return firstValueFrom(this.qcTestsClient.send(QC_TESTS_UPDATE, { ...body, id: params.id, user, tracing }));
  }

  @Get()
  @Version('1')
  @Permission('qc-test:list')
  async list(@Req() { query }: ApiRequest) {
    const input = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page)
    };
    return firstValueFrom(this.qcTestsClient.send(QC_TESTS_LIST, input));
  }

  @Get(':id')
  @Version('1')
  @Permission('qc-test:getbyid')
  async getById(@Req() { params }: ApiRequest) {
    return firstValueFrom(this.qcTestsClient.send(QC_TESTS_GET_BY_ID, params));
  }

  @Delete(':id')
  @Version('1')
  @Permission('qc-test:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest) {
    return firstValueFrom(this.qcTestsClient.send(QC_TESTS_DELETE, { id: params.id, user, tracing }));
  }
}
