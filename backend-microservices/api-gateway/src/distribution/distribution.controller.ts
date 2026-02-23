import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderStatus,
  DistributionPriority,
  SALES_ORDER_PATTERNS,
  CreateShipmentDto,
  UpdateShipmentDto,
  ShipmentStatus,
  SHIPMENT_PATTERNS,
  AllocateStockDto,
  PickItemDto,
  PackItemDto,
  ShipOrderDto,
  PROOF_OF_DELIVERY_PATTERNS,
  ACCOUNT_PATTERNS,
  CreateAccountDto,
  UpdateAccountDto,
  AccountType,
} from '@repo/shared';

@Controller('distribution')
export class DistributionController {
  constructor(
    @Inject('SALES_ORDER_SERVICE')
    private salesOrderClient: ClientProxy,
    @Inject('SHIPMENT_SERVICE')
    private shipmentClient: ClientProxy,
    @Inject('SALES_CRM_SERVICE')
    private salesCrmClient: ClientProxy,
  ) {}

  // Distributors (accounts with type=distributor)
  @Get('distributors')
  async getDistributors(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = { type: AccountType.DISTRIBUTOR };
    if (search) params.search = search;
    if (status) params.status = status;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.LIST, params)
    );
    const data = result as { accounts?: any[]; pagination?: any };
    const accounts = data.accounts ?? (Array.isArray(result) ? result : []);
    const pagination = data.pagination ?? { page: 1, pages: 1, total: accounts.length };
    const distributors = accounts.map((a: any) => ({
      id: String(a.id),
      name: a.accountName ?? a.name,
      code: a.accountCode ?? a.code,
      contactPerson: a.billingAddress?.contactPerson ?? a.contactPerson ?? '',
      email: a.email ?? '',
      phone: a.phone ?? '',
      address: a.billingAddress?.street ?? a.address ?? '',
      city: a.billingAddress?.city ?? a.city ?? '',
      state: a.billingAddress?.state ?? a.state ?? '',
      country: a.billingAddress?.country ?? a.country ?? '',
      postalCode: a.billingAddress?.postalCode ?? a.postalCode ?? '',
      rating: a.rating ?? 0,
      performance: a.performance ?? { onTimeDelivery: 0, qualityScore: 0, responseTime: 0 },
      contractStatus: a.contractStatus ?? 'pending',
      contractStartDate: a.contractStartDate ?? '',
      contractEndDate: a.contractEndDate ?? '',
      isActive: a.status === 'active',
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
    return {
      success: true,
      data: { distributors, pagination },
    };
  }

  @Post('distributors')
  async createDistributor(@Body() body: Omit<CreateAccountDto, 'type'> & { type?: AccountType }) {
    const createDto: CreateAccountDto = {
      ...body,
      type: AccountType.DISTRIBUTOR,
      createdBy: body.createdBy ?? 1,
    };
    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Get('distributors/:id')
  async getDistributor(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Put('distributors/:id')
  async updateDistributor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAccountDto,
  ) {
    const result = await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  @Delete('distributors/:id')
  async deleteDistributor(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(
      this.salesCrmClient.send(ACCOUNT_PATTERNS.DELETE, id)
    );
    return { success: true, message: 'Distributor deleted successfully' };
  }

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

  // Shipments
  @Get('shipments')
  async getShipments(
    @Query('search') search?: string,
    @Query('salesOrderId') salesOrderId?: string,
    @Query('accountId') accountId?: string,
    @Query('siteId') siteId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (salesOrderId) params.salesOrderId = parseInt(salesOrderId);
    if (accountId) params.accountId = parseInt(accountId);
    if (siteId) params.siteId = parseInt(siteId);
    if (status) params.status = status as ShipmentStatus;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.LIST, params)
    );
    return { success: true, data: result };
  }

  @Post('shipments')
  async createShipment(@Body() createDto: CreateShipmentDto) {
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Get('shipments/:id')
  async getShipment(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Put('shipments')
  async updateShipment(@Body() body: { id: number; [key: string]: any }) {
    const { id, ...updateDto } = body;
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  @Get('shipments/sales-order/:salesOrderId')
  async getShipmentsBySalesOrder(@Param('salesOrderId', ParseIntPipe) salesOrderId: number) {
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.GET_BY_SALES_ORDER, salesOrderId)
    );
    return { success: true, data: result };
  }

  @Post('shipments/allocate-stock')
  async allocateStock(@Body() allocateDto: AllocateStockDto) {
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.ALLOCATE_STOCK, allocateDto)
    );
    return { success: true, data: result };
  }

  @Post('shipments/pick-item')
  async pickItem(@Body() pickDto: PickItemDto) {
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.PICK_ITEM, pickDto)
    );
    return { success: true, data: result };
  }

  @Post('shipments/pack-item')
  async packItem(@Body() packDto: PackItemDto) {
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.PACK_ITEM, packDto)
    );
    return { success: true, data: result };
  }

  @Post('shipments/:id/ship')
  async shipOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() shipDto: ShipOrderDto,
  ) {
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.SHIP_ORDER, { id, shipDto })
    );
    return { success: true, data: result };
  }

  @Post('shipments/:id/cancel')
  async cancelShipment(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.CANCEL, id)
    );
    return { success: true, data: result };
  }

  @Delete('shipments')
  async deleteShipment(@Query('id') id: string) {
    await firstValueFrom(
      this.shipmentClient.send(SHIPMENT_PATTERNS.DELETE, parseInt(id))
    );
    return { success: true, message: 'Shipment deleted successfully' };
  }

  // Proof of Delivery
  @Get('proof-of-delivery')
  async getPODs(
    @Query('shipmentId') shipmentId?: string,
    @Query('salesOrderId') salesOrderId?: string,
    @Query('status') status?: string,
  ) {
    const params: any = {};
    if (shipmentId) params.shipmentId = parseInt(shipmentId);
    if (salesOrderId) params.salesOrderId = parseInt(salesOrderId);
    if (status) params.status = status;

    const result = await firstValueFrom(
      this.shipmentClient.send(PROOF_OF_DELIVERY_PATTERNS.LIST, params)
    );
    return { success: true, data: result };
  }

  @Post('proof-of-delivery')
  async createPOD(@Body() data: any) {
    const result = await firstValueFrom(
      this.shipmentClient.send(PROOF_OF_DELIVERY_PATTERNS.CREATE, data)
    );
    return { success: true, data: result };
  }

  @Get('proof-of-delivery/:id')
  async getPOD(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.shipmentClient.send(PROOF_OF_DELIVERY_PATTERNS.GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Get('proof-of-delivery/shipment/:shipmentId')
  async getPODsByShipment(@Param('shipmentId', ParseIntPipe) shipmentId: number) {
    const result = await firstValueFrom(
      this.shipmentClient.send(PROOF_OF_DELIVERY_PATTERNS.GET_BY_SHIPMENT, shipmentId)
    );
    return { success: true, data: result };
  }

  @Post('proof-of-delivery/:id/complete')
  async completePOD(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { completedBy: number },
  ) {
    const result = await firstValueFrom(
      this.shipmentClient.send(PROOF_OF_DELIVERY_PATTERNS.COMPLETE, { id, completedBy: body.completedBy })
    );
    return { success: true, data: result };
  }
}

