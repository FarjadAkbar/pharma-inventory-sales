import { Controller, Get, HttpCode, Post, Req, Version } from '@nestjs/common';

import { QCTestCreateInput, QCTestCreateOutput } from '@/core/qc-test/use-cases/qc-test-create';
import { QCTestListOutput } from '@/core/qc-test/use-cases/qc-test-list';
import { QCTestListInput } from '@/core/qc-test/repository/qc-test';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import { IQCTestCreateAdapter, IQCTestListAdapter } from './adapter';

@Controller('qc-tests')
export class QCTestController {
  constructor(
    private readonly createUsecase: IQCTestCreateAdapter,
    private readonly listUsecase: IQCTestListAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('qc-test:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<QCTestCreateOutput> {
    return this.createUsecase.execute(body as QCTestCreateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('qc-test:list')
  async list(@Req() { query }: ApiRequest): Promise<QCTestListOutput> {
    const input: QCTestListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      materialType: query.materialType as string | undefined
    };

    return await this.listUsecase.execute(input);
  }
}
