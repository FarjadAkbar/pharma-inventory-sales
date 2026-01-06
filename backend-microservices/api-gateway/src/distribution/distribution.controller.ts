import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderStatus,
  DistributionPriority,
  SALES_ORDER_PATTERNS,
} from '@repo/shared';

@Controller('distribution')
export class DistributionController {
  constructor(
    @Inject('SALES_ORDER_SERVICE')
    private salesOrderClient: ClientProxy,
  ) {}

  // Sales Orders
  @Get('sales-orders')
  async getSalesOrders(
    @Query('search') search?: string,
    @Query('accountId') accountId?: string,
    @Query('siteId') siteId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (accountId) params.accountId = parseInt(accountId);
    if (siteId) params.siteId = parseInt(siteId);
    if (status) params.status = status as SalesOrderStatus;
    if (priority) params.priority = priority as DistributionPriority;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.LIST, params)
    );
    return { success: true, data: result };
  }

  @Post('sales-orders')
  async createSalesOrder(@Body() createDto: CreateSalesOrderDto) {
    const result = await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Get('sales-orders/:id')
  async getSalesOrder(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Put('sales-orders')
  async updateSalesOrder(@Body() body: { id: number; [key: string]: any }) {
    const { id, ...updateDto } = body;
    const result = await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  @Post('sales-orders/:id/approve')
  async approveSalesOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approvedBy: number },
  ) {
    const result = await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.APPROVE, { id, approvedBy: body.approvedBy })
    );
    return { success: true, data: result };
  }

  @Post('sales-orders/:id/cancel')
  async cancelSalesOrder(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.CANCEL, id)
    );
    return { success: true, data: result };
  }

  @Delete('sales-orders')
  async deleteSalesOrder(@Query('id') id: string) {
    await firstValueFrom(
      this.salesOrderClient.send(SALES_ORDER_PATTERNS.DELETE, parseInt(id))
    );
    return { success: true, message: 'Sales order deleted successfully' };
  }
}

