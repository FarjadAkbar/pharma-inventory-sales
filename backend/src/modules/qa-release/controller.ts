import { Controller, Get, HttpCode, Post, Req, Version } from '@nestjs/common';

import { QAReleaseCreateInput, QAReleaseCreateOutput } from '@/core/qa-release/use-cases/qa-release-create';
import { QAReleaseListOutput } from '@/core/qa-release/use-cases/qa-release-list';
import { QAReleaseListInput } from '@/core/qa-release/repository/qa-release';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import { IQAReleaseCreateAdapter, IQAReleaseListAdapter } from './adapter';

@Controller('qa-releases')
export class QAReleaseController {
  constructor(
    private readonly createUsecase: IQAReleaseCreateAdapter,
    private readonly listUsecase: IQAReleaseListAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('qa-release:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<QAReleaseCreateOutput> {
    return this.createUsecase.execute(body as QAReleaseCreateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('qa-release:list')
  async list(@Req() { query }: ApiRequest): Promise<QAReleaseListOutput> {
    const input: QAReleaseListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      decision: query.decision as 'Release' | 'Reject' | 'Hold' | undefined,
      entityType: query.entityType as 'GoodsReceipt' | 'Batch' | undefined
    };

    return await this.listUsecase.execute(input);
  }
}
