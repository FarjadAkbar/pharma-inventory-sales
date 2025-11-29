import { Controller, Get, HttpCode, Post, Put, Req, Version } from '@nestjs/common';

import { DeviationCreateInput, DeviationCreateOutput } from '@/core/deviation/use-cases/deviation-create';
import { DeviationUpdateInput, DeviationUpdateOutput } from '@/core/deviation/use-cases/deviation-update';
import { DeviationListOutput } from '@/core/deviation/use-cases/deviation-list';
import { DeviationCloseInput, DeviationCloseOutput } from '@/core/deviation/use-cases/deviation-close';
import { DeviationListInput } from '@/core/deviation/repository/deviation';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import { IDeviationCreateAdapter, IDeviationUpdateAdapter, IDeviationListAdapter, IDeviationCloseAdapter } from './adapter';

@Controller('deviations')
export class DeviationController {
  constructor(
    private readonly createUsecase: IDeviationCreateAdapter,
    private readonly updateUsecase: IDeviationUpdateAdapter,
    private readonly listUsecase: IDeviationListAdapter,
    private readonly closeUsecase: IDeviationCloseAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('deviation:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<DeviationCreateOutput> {
    return this.createUsecase.execute(body as DeviationCreateInput, { user, tracing });
  }

  @Put(':id')
  @Version('1')
  @Permission('deviation:update')
  async update(@Req() { params, body, user, tracing }: ApiRequest): Promise<DeviationUpdateOutput> {
    return await this.updateUsecase.execute({ id: params.id, ...body } as DeviationUpdateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('deviation:list')
  async list(@Req() { query }: ApiRequest): Promise<DeviationListOutput> {
    const input: DeviationListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      severity: query.severity as 'Low' | 'Medium' | 'High' | 'Critical' | undefined,
      status: query.status as 'Open' | 'Investigating' | 'Resolved' | 'Closed' | undefined
    };

    return await this.listUsecase.execute(input);
  }

  @Post(':id/close')
  @Version('1')
  @Permission('deviation:close')
  async close(@Req() { params, user, tracing }: ApiRequest): Promise<DeviationCloseOutput> {
    return await this.closeUsecase.execute({ id: params.id } as DeviationCloseInput, { user, tracing });
  }
}
