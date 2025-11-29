import { Controller, Get, HttpCode, Post, Req, Version } from '@nestjs/common';

import { QCResultCreateInput, QCResultCreateOutput } from '@/core/qc-result/use-cases/qc-result-create';
import { QCResultListOutput } from '@/core/qc-result/use-cases/qc-result-list';
import { QCResultListInput } from '@/core/qc-result/repository/qc-result';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import { IQCResultCreateAdapter, IQCResultListAdapter } from './adapter';

@Controller('qc-results')
export class QCResultController {
  constructor(
    private readonly createUsecase: IQCResultCreateAdapter,
    private readonly listUsecase: IQCResultListAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('qc-result:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<QCResultCreateOutput> {
    return this.createUsecase.execute(body as QCResultCreateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('qc-result:list')
  async list(@Req() { query }: ApiRequest): Promise<QCResultListOutput> {
    const input: QCResultListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      sampleId: query.sampleId as string | undefined,
      testId: query.testId as string | undefined,
      passed: query.passed === 'true' ? true : query.passed === 'false' ? false : undefined
    };

    return await this.listUsecase.execute(input);
  }
}
