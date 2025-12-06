import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version } from '@nestjs/common';

import { SiteCreateInput, SiteCreateOutput } from '@/core/site/use-cases/site-create';
import { SiteDeleteInput, SiteDeleteOutput } from '@/core/site/use-cases/site-delete';
import { SiteGetByIdInput, SiteGetByIdOutput } from '@/core/site/use-cases/site-get-by-id';
import { SiteListInput, SiteListOutput } from '@/core/site/use-cases/site-list';
import { SiteUpdateInput, SiteUpdateOutput } from '@/core/site/use-cases/site-update';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import { SiteEntity } from '@/core/site/entity/site';

import {
  ISiteCreateAdapter,
  ISiteDeleteAdapter,
  ISiteGetByIdAdapter,
  ISiteListAdapter,
  ISiteUpdateAdapter
} from './adapter';

@Controller('sites')
export class SiteController {
  constructor(
    private readonly createUsecase: ISiteCreateAdapter,
    private readonly updateUsecase: ISiteUpdateAdapter,
    private readonly deleteUsecase: ISiteDeleteAdapter,
    private readonly listUsecase: ISiteListAdapter,
    private readonly getByIdUsecase: ISiteGetByIdAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('site:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<SiteCreateOutput> {
    return this.createUsecase.execute(body as SiteCreateInput, { user, tracing });
  }

  @Put(':id')
  @Version('1')
  @Permission('site:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest): Promise<SiteUpdateOutput> {
    return this.updateUsecase.execute({ ...body, id: params.id } as SiteUpdateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('site:list')
  async list(@Req() { query }: ApiRequest): Promise<SiteListOutput> {
    const input: SiteListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: (SearchHttpSchema.parse(query.search) as unknown as Partial<SiteEntity>) || null,
      limit: Number(query.limit),
      page: Number(query.page)
    };

    return await this.listUsecase.execute(input);
  }

  @Get(':id')
  @Version('1')
  @Permission('site:getbyid')
  async getById(@Req() { params }: ApiRequest): Promise<SiteGetByIdOutput> {
    return await this.getByIdUsecase.execute(params as SiteGetByIdInput);
  }

  @Delete(':id')
  @Version('1')
  @Permission('site:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest): Promise<SiteDeleteOutput> {
    return await this.deleteUsecase.execute(params as SiteDeleteInput, { user, tracing });
  }
}
