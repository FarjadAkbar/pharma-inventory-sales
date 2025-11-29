import { Controller, Delete, Get, HttpCode, Post, Req, Version } from '@nestjs/common';

import { PurchaseOrderCreateInput, PurchaseOrderCreateOutput } from '@/core/purchase-order/use-cases/purchase-order-create';
import { PurchaseOrderDeleteInput, PurchaseOrderDeleteOutput } from '@/core/purchase-order/use-cases/purchase-order-delete';
import { PurchaseOrderGetByIdInput, PurchaseOrderGetByIdOutput } from '@/core/purchase-order/use-cases/purchase-order-get-by-id';
import { PurchaseOrderListOutput } from '@/core/purchase-order/use-cases/purchase-order-list';
import { PurchaseOrderApproveInput, PurchaseOrderApproveOutput } from '@/core/purchase-order/use-cases/purchase-order-approve';
import { PurchaseOrderCancelInput, PurchaseOrderCancelOutput } from '@/core/purchase-order/use-cases/purchase-order-cancel';
import { PurchaseOrderListInput } from '@/core/purchase-order/repository/purchase-order';
import { Permission } from '@/utils/decorators';
import { ApiRequest } from '@/utils/request';
import { SearchHttpSchema } from '@/utils/search';
import { SortHttpSchema } from '@/utils/sort';

import {
  IPurchaseOrderCreateAdapter,
  IPurchaseOrderDeleteAdapter,
  IPurchaseOrderGetByIdAdapter,
  IPurchaseOrderListAdapter,
  IPurchaseOrderApproveAdapter,
  IPurchaseOrderCancelAdapter
} from './adapter';

@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(
    private readonly createUsecase: IPurchaseOrderCreateAdapter,
    private readonly getByIdUsecase: IPurchaseOrderGetByIdAdapter,
    private readonly listUsecase: IPurchaseOrderListAdapter,
    private readonly approveUsecase: IPurchaseOrderApproveAdapter,
    private readonly cancelUsecase: IPurchaseOrderCancelAdapter,
    private readonly deleteUsecase: IPurchaseOrderDeleteAdapter
  ) {}

  @Post()
  @Version('1')
  @Permission('purchase-order:create')
  @HttpCode(201)
  async create(@Req() { body, user, tracing }: ApiRequest): Promise<PurchaseOrderCreateOutput> {
    return this.createUsecase.execute(body as PurchaseOrderCreateInput, { user, tracing });
  }

  @Get()
  @Version('1')
  @Permission('purchase-order:list')
  async list(@Req() { query }: ApiRequest): Promise<PurchaseOrderListOutput> {
    const input: PurchaseOrderListInput = {
      sort: SortHttpSchema.parse(query.sort),
      search: SearchHttpSchema.parse(query.search) || undefined,
      limit: Number(query.limit),
      page: Number(query.page),
      status: query.status as 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled' | undefined,
      supplierId: query.supplierId as string | undefined
    };

    return await this.listUsecase.execute(input);
  }

  @Get(':id')
  @Version('1')
  @Permission('purchase-order:getbyid')
  async getById(@Req() { params }: ApiRequest): Promise<PurchaseOrderGetByIdOutput> {
    return await this.getByIdUsecase.execute(params as PurchaseOrderGetByIdInput);
  }

  @Post(':id/approve')
  @Version('1')
  @Permission('purchase-order:approve')
  async approve(@Req() { params, user, tracing }: ApiRequest): Promise<PurchaseOrderApproveOutput> {
    return await this.approveUsecase.execute({ id: params.id } as PurchaseOrderApproveInput, { user, tracing });
  }

  @Post(':id/cancel')
  @Version('1')
  @Permission('purchase-order:cancel')
  async cancel(@Req() { params, user, tracing }: ApiRequest): Promise<PurchaseOrderCancelOutput> {
    return await this.cancelUsecase.execute({ id: params.id } as PurchaseOrderCancelInput, { user, tracing });
  }

  @Delete(':id')
  @Version('1')
  @Permission('purchase-order:delete')
  async delete(@Req() { params, user, tracing }: ApiRequest): Promise<PurchaseOrderDeleteOutput> {
    return await this.deleteUsecase.execute(params as PurchaseOrderDeleteInput, { user, tracing });
  }
}
