import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version } from '@nestjs/common';

import { SupplierCreateInput, SupplierCreateOutput } from '@/core/supplier/use-cases/supplier-create';
import { SupplierDeleteInput, SupplierDeleteOutput } from '@/core/supplier/use-cases/supplier-delete';
import { SupplierGetByIdInput, SupplierGetByIdOutput } from '@/core/supplier/use-cases/supplier-get-by-id';
import { SupplierListOutput } from '@/core/supplier/use-cases/supplier-list';
import {
  SupplierUpdateRatingInput,
  SupplierUpdateRatingOutput
} from '@/core/supplier/use-cases/supplier-update-rating';
import { SupplierUpdateInput, SupplierUpdateOutput } from '@/core/supplier/use-cases/supplier-update';
import { SupplierListInput } from '@/core/supplier/repository/supplier';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import {
  ISupplierCreateAdapter,
  ISupplierDeleteAdapter,
  ISupplierGetByIdAdapter,
  ISupplierListAdapter,
  ISupplierUpdateAdapter,
  ISupplierUpdateRatingAdapter
} from './adapter';

@Controller('suppliers')
export class SupplierController {
  constructor(
    private readonly createUsecase: ISupplierCreateAdapter,
    private readonly updateUsecase: ISupplierUpdateAdapter,
    private readonly deleteUsecase: ISupplierDeleteAdapter,
    private readonly listUsecase: ISupplierListAdapter,
    private readonly getByIdUsecase: ISupplierGetByIdAdapter,
    private readonly updateRatingUsecase: ISupplierUpdateRatingAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('supplier:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<SupplierCreateOutput> {
    return this.createUsecase.execute(body as SupplierCreateInput, { user, tracing });
  }

  @Put(':id')
  @Version('1')
  @Permission('supplier:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest): Promise<SupplierUpdateOutput> {
    return this.updateUsecase.execute({ ...body, id: params.id } as SupplierUpdateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('supplier:list')
  async list(@Req() { query }: ApiRequest): Promise<SupplierListOutput> {
    const input: SupplierListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      status: query.status as 'Active' | 'Inactive' | undefined
    };

    return await this.listUsecase.execute(input);
  }

  @Get(':id')
  @Version('1')
  @Permission('supplier:getbyid')
  async getById(@Req() { params }: ApiRequest): Promise<SupplierGetByIdOutput> {
    return await this.getByIdUsecase.execute(params as SupplierGetByIdInput);
  }

  @Put(':id/rating')
  @Version('1')
  @Permission('supplier:updaterating')
  async updateRating(@Req() { params, body }: ApiRequest): Promise<SupplierUpdateRatingOutput> {
    return await this.updateRatingUsecase.execute({ id: params.id, ...body } as SupplierUpdateRatingInput);
  }

  @Delete(':id')
  @Version('1')
  @Permission('supplier:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest): Promise<SupplierDeleteOutput> {
    return await this.deleteUsecase.execute(params as SupplierDeleteInput, { user, tracing });
  }
}
