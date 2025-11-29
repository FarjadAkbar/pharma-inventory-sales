import { Controller, Get, HttpCode, Post, Req, Version } from '@nestjs/common';

import { QCSampleCreateInput, QCSampleCreateOutput } from '@/core/qc-sample/use-cases/qc-sample-create';
import { QCSampleListOutput } from '@/core/qc-sample/use-cases/qc-sample-list';
import { QCSampleAssignInput, QCSampleAssignOutput } from '@/core/qc-sample/use-cases/qc-sample-assign';
import { QCSampleCompleteInput, QCSampleCompleteOutput } from '@/core/qc-sample/use-cases/qc-sample-complete';
import { QCSampleListInput } from '@/core/qc-sample/repository/qc-sample';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import {
  IQCSampleCreateAdapter,
  IQCSampleListAdapter,
  IQCSampleAssignAdapter,
  IQCSampleCompleteAdapter
} from './adapter';

@Controller('qc-samples')
export class QCSampleController {
  constructor(
    private readonly createUsecase: IQCSampleCreateAdapter,
    private readonly listUsecase: IQCSampleListAdapter,
    private readonly assignUsecase: IQCSampleAssignAdapter,
    private readonly completeUsecase: IQCSampleCompleteAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('qc-sample:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<QCSampleCreateOutput> {
    return this.createUsecase.execute(body as QCSampleCreateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('qc-sample:list')
  async list(@Req() { query }: ApiRequest): Promise<QCSampleListOutput> {
    const input: QCSampleListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      status: query.status as 'Pending' | 'InProgress' | 'Completed' | 'Failed' | undefined,
      priority: query.priority as 'Low' | 'Medium' | 'High' | undefined,
      assignedTo: query.assignedTo as string | undefined
    };

    return await this.listUsecase.execute(input);
  }

  @Post(':id/assign')
  @Version('1')
  @Permission('qc-sample:assign')
  async assign(@Req() { params, body, user, tracing }: ApiRequest): Promise<QCSampleAssignOutput> {
    return await this.assignUsecase.execute({ id: params.id, userId: body.userId } as QCSampleAssignInput, { user, tracing });
  }

  @Post(':id/complete')
  @Version('1')
  @Permission('qc-sample:complete')
  async complete(@Req() { params, user, tracing }: ApiRequest): Promise<QCSampleCompleteOutput> {
    return await this.completeUsecase.execute({ id: params.id } as QCSampleCompleteInput, { user, tracing });
  }
}
