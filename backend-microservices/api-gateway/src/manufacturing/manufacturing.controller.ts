import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  CreateBatchDto,
  StartBatchDto,
  CompleteBatchDto,
  SubmitBatchToQCDto,
  ReceiveFinishedGoodsDto,
  ConsumeMaterialDto,
  UpdateMaterialConsumptionDto,
  ExecuteBatchStepDto,
  CreateBOMDto,
  UpdateBOMDto,
  BOMStatus,
  MaterialConsumptionStatus,
  WorkOrderStatus,
  ManufacturingPriority,
  BatchStatus,
  MANUFACTURING_PATTERNS,
} from '@repo/shared';

@Controller('manufacturing')
export class ManufacturingController {
  constructor(
    @Inject('MANUFACTURING_SERVICE')
    private manufacturingClient: ClientProxy,
  ) {}

  // Work Orders
  @Get('work-orders')
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
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_LIST, params)
    );
    return { success: true, data: result };
  }

  @Post('work-orders')
  async createWorkOrder(@Body() createDto: CreateWorkOrderDto) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Get('work-orders/:id')
  async getWorkOrder(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Put('work-orders/:id')
  async updateWorkOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWorkOrderDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  // Batches
  @Get('batches')
  async getBatches(
    @Query('search') search?: string,
    @Query('drugId') drugId?: string,
    @Query('siteId') siteId?: string,
    @Query('status') status?: string,
    @Query('workOrderId') workOrderId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (drugId) params.drugId = parseInt(drugId);
    if (siteId) params.siteId = parseInt(siteId);
    if (status) params.status = status as BatchStatus;
    if (workOrderId) params.workOrderId = parseInt(workOrderId);
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_LIST, params)
    );
    return { success: true, data: result };
  }

  @Post('batches')
  async createBatch(@Body() createDto: CreateBatchDto) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Get('batches/:id')
  async getBatch(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Post('batches/:id/start')
  async startBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() startDto: StartBatchDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_START, { id, startDto })
    );
    return { success: true, data: result };
  }

  @Post('batches/:id/consume-material')
  async consumeMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() consumeDto: ConsumeMaterialDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_CREATE, {
        batchId: id,
        consumeDto,
      })
    );
    return { success: true, data: result };
  }

  @Post('batches/:id/execute-step')
  async executeBatchStep(
    @Param('id', ParseIntPipe) id: number,
    @Body() executeDto: ExecuteBatchStepDto,
  ) {
    // First create the step if it doesn't exist, then execute it
    const step = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_STEP_CREATE, {
        batchId: id,
        createDto: executeDto,
      })
    );
    
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_STEP_EXECUTE, {
        batchId: id,
        stepId: step.id,
        executeDto,
      })
    );
    return { success: true, data: result };
  }

  @Post('batches/:id/complete')
  async completeBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() completeDto: CompleteBatchDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_COMPLETE, { id, completeDto })
    );
    return { success: true, data: result };
  }

  @Post('batches/:id/submit-to-qc')
  async submitBatchToQC(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitDto: SubmitBatchToQCDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_SUBMIT_TO_QC, { id, submitDto })
    );
    return { success: true, data: result };
  }

  @Post('batches/:id/receive-finished-goods')
  async receiveFinishedGoods(
    @Param('id', ParseIntPipe) id: number,
    @Body() receiveDto: ReceiveFinishedGoodsDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_RECEIVE_FINISHED_GOODS, {
        id,
        receiveDto,
      })
    );
    return { success: true, data: result };
  }

  // Batch Steps
  @Get('batches/:id/steps')
  async getBatchSteps(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_STEP_GET_BY_BATCH, id)
    );
    return { success: true, data: result };
  }

  // Material Consumption
  @Get('material-consumption')
  async getMaterialConsumptions(
    @Query('batchId') batchId?: string,
    @Query('materialId') materialId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (batchId) params.batchId = parseInt(batchId);
    if (materialId) params.materialId = parseInt(materialId);
    if (status) params.status = status as MaterialConsumptionStatus;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_LIST, params)
    );
    return { success: true, data: result };
  }

  @Get('batches/:id/material-consumption')
  async getMaterialConsumptionByBatch(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_GET_BY_BATCH, id)
    );
    return { success: true, data: result };
  }

  @Get('material-consumption/:id')
  async getMaterialConsumption(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Put('material-consumption/:id')
  async updateMaterialConsumption(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMaterialConsumptionDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  @Delete('material-consumption/:id')
  async deleteMaterialConsumption(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_DELETE, id)
    );
    return { success: true, message: 'Material consumption deleted successfully' };
  }

  // BOMs
  @Get('boms')
  async getBOMs(
    @Query('search') search?: string,
    @Query('drugId') drugId?: string,
    @Query('status') status?: string,
    @Query('version') version?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (search) params.search = search;
    if (drugId) params.drugId = parseInt(drugId);
    if (status) params.status = status as BOMStatus;
    if (version) params.version = parseInt(version);
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_LIST, params)
    );
    return { success: true, data: result };
  }

  @Post('boms')
  async createBOM(@Body() createDto: CreateBOMDto) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_CREATE, createDto)
    );
    return { success: true, data: result };
  }

  @Get('boms/:id')
  async getBOM(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_GET_BY_ID, id)
    );
    return { success: true, data: result };
  }

  @Put('boms/:id')
  async updateBOM(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBOMDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_UPDATE, { id, updateDto })
    );
    return { success: true, data: result };
  }

  @Delete('boms/:id')
  async deleteBOM(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_DELETE, id)
    );
    return { success: true, message: 'BOM deleted successfully' };
  }

  @Post('boms/:id/approve')
  async approveBOM(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approvedBy: number },
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BOM_APPROVE, { id, approvedBy: body.approvedBy })
    );
    return { success: true, data: result };
  }

  // EBR
  @Get('ebr')
  async getEBRs(
    @Query('batchId') batchId?: string,
    @Query('drugId') drugId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params: any = {};
    if (batchId) params.batchId = parseInt(batchId);
    if (drugId) params.drugId = parseInt(drugId);
    if (status) params.status = status;
    if (page) params.page = parseInt(page);
    if (limit) params.limit = parseInt(limit);

    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.EBR_LIST, params)
    );
    return { success: true, data: result };
  }

  @Get('ebr/:batchId')
  async getEBRByBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.EBR_GET_BY_BATCH, batchId)
    );
    return { success: true, data: result };
  }
}

