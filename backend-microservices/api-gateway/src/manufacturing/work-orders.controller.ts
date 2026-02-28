import { Controller, Get, Post, Put, Body, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  MANUFACTURING_PATTERNS,
  WorkOrderStatus,
  ManufacturingPriority,
} from '@repo/shared';

@Controller('manufacturing/work-orders')
export class WorkOrdersController {
  constructor(
    @Inject('MANUFACTURING_SERVICE')
    private manufacturingClient: ClientProxy,
  ) {}

  @Get()
  async getWorkOrders(
    @Query('search') search?: string,
    @Query('drugId') drugId?: string,
    @Query('siteId') siteId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (drugId) params.drugId = parseInt(drugId);
    if (siteId) params.siteId = parseInt(siteId);
    if (status) params.status = status as WorkOrderStatus;
    if (priority) params.priority = priority as ManufacturingPriority;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_LIST, params),
    );
    return { success: true, data: result };
  }

  @Post()
  async createWorkOrder(@Body() createDto: CreateWorkOrderDto) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_CREATE, createDto),
    );
    return { success: true, data: result };
  }

  @Get(':id')
  async getWorkOrder(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_GET_BY_ID, id),
    );
    return { success: true, data: result };
  }

  @Put(':id')
  async updateWorkOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWorkOrderDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_UPDATE, { id, updateDto }),
    );
    return { success: true, data: result };
  }
}
