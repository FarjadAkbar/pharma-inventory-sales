import { Controller, Delete, Get, HttpCode, Post, Put, Req, Version } from '@nestjs/common';

import { DrugCreateInput, DrugCreateOutput } from '@/core/drug/use-cases/drug-create';
import { DrugDeleteInput, DrugDeleteOutput } from '@/core/drug/use-cases/drug-delete';
import { DrugGetByIdInput, DrugGetByIdOutput } from '@/core/drug/use-cases/drug-get-by-id';
import { DrugListOutput } from '@/core/drug/use-cases/drug-list';
import { DrugUpdateInput, DrugUpdateOutput } from '@/core/drug/use-cases/drug-update';
import { DrugApproveInput, DrugApproveOutput } from '@/core/drug/use-cases/drug-approve';
import { DrugRejectInput, DrugRejectOutput } from '@/core/drug/use-cases/drug-reject';
import { DrugListInput } from '@/core/drug/repository/drug';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import {
  IDrugCreateAdapter,
  IDrugDeleteAdapter,
  IDrugGetByIdAdapter,
  IDrugListAdapter,
  IDrugUpdateAdapter,
  IDrugApproveAdapter,
  IDrugRejectAdapter
} from './adapter';

@Controller('drugs')
export class DrugController {
  constructor(
    private readonly createUsecase: IDrugCreateAdapter,
    private readonly updateUsecase: IDrugUpdateAdapter,
    private readonly deleteUsecase: IDrugDeleteAdapter,
    private readonly listUsecase: IDrugListAdapter,
    private readonly getByIdUsecase: IDrugGetByIdAdapter,
    private readonly approveUsecase: IDrugApproveAdapter,
    private readonly rejectUsecase: IDrugRejectAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('drug:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<DrugCreateOutput> {
    return this.createUsecase.execute(body as DrugCreateInput, { user, tracing });
  }

  @Put(':id')
  @Version('1')
  @Permission('drug:update')
  async update(@Req() { body, user, tracing, params }: ApiRequest): Promise<DrugUpdateOutput> {
    return this.updateUsecase.execute({ ...body, id: params.id } as DrugUpdateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('drug:list')
  async list(@Req() { query }: ApiRequest): Promise<DrugListOutput> {
    const input: DrugListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search),
      limit: Number(query.limit),
      page: Number(query.page),
      approvalStatus: query.approvalStatus as 'Draft' | 'Pending' | 'Approved' | 'Rejected' | undefined
    };

    return await this.listUsecase.execute(input);
  }

  @Get(':id')
  @Version('1')
  @Permission('drug:getbyid')
  async getById(@Req() { params }: ApiRequest): Promise<DrugGetByIdOutput> {
    return await this.getByIdUsecase.execute(params as DrugGetByIdInput);
  }

  @Post(':id/approve')
  @Version('1')
  @Permission('drug:approve')
  async approve(@Req() { params, user, tracing }: ApiRequest): Promise<DrugApproveOutput> {
    return await this.approveUsecase.execute({ id: params.id } as DrugApproveInput, { user, tracing });
  }

  @Post(':id/reject')
  @Version('1')
  @Permission('drug:reject')
  async reject(@Req() { params, user, tracing }: ApiRequest): Promise<DrugRejectOutput> {
    return await this.rejectUsecase.execute({ id: params.id } as DrugRejectInput, { user, tracing });
  }

  @Delete(':id')
  @Version('1')
  @Permission('drug:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest): Promise<DrugDeleteOutput> {
    return await this.deleteUsecase.execute(params as DrugDeleteInput, { user, tracing });
  }
}
