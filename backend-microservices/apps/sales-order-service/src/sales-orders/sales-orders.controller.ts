import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SalesOrdersService } from './sales-orders.service';
import {
  SALES_ORDER_PATTERNS,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderStatus,
  DistributionPriority,
} from '@repo/shared';

@Controller()
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @MessagePattern(SALES_ORDER_PATTERNS.CREATE)
  create(@Payload() createDto: CreateSalesOrderDto) {
    return this.salesOrdersService.create(createDto);
  }

  @MessagePattern(SALES_ORDER_PATTERNS.LIST)
  findAll(@Payload() params?: {
    search?: string;
    accountId?: number;
    siteId?: number;
    status?: SalesOrderStatus;
    priority?: DistributionPriority;
    page?: number;
    limit?: number;
  }) {
    return this.salesOrdersService.findAll(params);
  }

  @MessagePattern(SALES_ORDER_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.salesOrdersService.findOne(id);
  }

  @MessagePattern(SALES_ORDER_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateSalesOrderDto }) {
    return this.salesOrdersService.update(data.id, data.updateDto);
  }

  @MessagePattern(SALES_ORDER_PATTERNS.APPROVE)
  approve(@Payload() data: { id: number; approvedBy: number }) {
    return this.salesOrdersService.approve(data.id, data.approvedBy);
  }

  @MessagePattern(SALES_ORDER_PATTERNS.CANCEL)
  cancel(@Payload() id: number) {
    return this.salesOrdersService.cancel(id);
  }

  @MessagePattern(SALES_ORDER_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.salesOrdersService.delete(id);
  }
}

