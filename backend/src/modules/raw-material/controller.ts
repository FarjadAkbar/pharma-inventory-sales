import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version } from '@nestjs/common';

import { RawMaterialCreateInput, RawMaterialCreateOutput } from '@/core/raw-material/use-cases/raw-material-create';
import { RawMaterialDeleteInput, RawMaterialDeleteOutput } from '@/core/raw-material/use-cases/raw-material-delete';
import { RawMaterialGetByIdInput, RawMaterialGetByIdOutput } from '@/core/raw-material/use-cases/raw-material-get-by-id';
import { RawMaterialListOutput } from '@/core/raw-material/use-cases/raw-material-list';
import { RawMaterialUpdateInput, RawMaterialUpdateOutput } from '@/core/raw-material/use-cases/raw-material-update';
import { RawMaterialListInput } from '@/core/raw-material/repository/raw-material';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import {
  IRawMaterialCreateAdapter,
  IRawMaterialDeleteAdapter,
  IRawMaterialGetByIdAdapter,
  IRawMaterialListAdapter,
  IRawMaterialUpdateAdapter
} from './adapter';

@Controller('raw-materials')
export class RawMaterialController {
  constructor(
    private readonly createUsecase: IRawMaterialCreateAdapter,
    private readonly updateUsecase: IRawMaterialUpdateAdapter,
    private readonly deleteUsecase: IRawMaterialDeleteAdapter,
    private readonly listUsecase: IRawMaterialListAdapter,
    private readonly getByIdUsecase: IRawMaterialGetByIdAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('raw-material:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<RawMaterialCreateOutput> {
    return this.createUsecase.execute(body as RawMaterialCreateInput, { user, tracing });
  }

  @Put(':id')
  @Version('1')
  @Permission('raw-material:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest): Promise<RawMaterialUpdateOutput> {
    return this.updateUsecase.execute({ ...body, id: params.id } as RawMaterialUpdateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('raw-material:list')
  async list(@Req() { query }: ApiRequest): Promise<RawMaterialListOutput> {
    const input: RawMaterialListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      supplierId: query.supplierId as string | undefined
    };

    return await this.listUsecase.execute(input);
  }

  @Get(':id')
  @Version('1')
  @Permission('raw-material:getbyid')
  async getById(@Req() { params }: ApiRequest): Promise<RawMaterialGetByIdOutput> {
    return await this.getByIdUsecase.execute(params as RawMaterialGetByIdInput);
  }

  @Delete(':id')
  @Version('1')
  @Permission('raw-material:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest): Promise<RawMaterialDeleteOutput> {
    return await this.deleteUsecase.execute(params as RawMaterialDeleteInput, { user, tracing });
  }
}
