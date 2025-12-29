import { Controller, Get, Post, Put, Body, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
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
  ExecuteBatchStepDto,
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
  async getWorkOrders() {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_LIST, {})
    );
  }

  @Post('work-orders')
  async createWorkOrder(@Body() createDto: CreateWorkOrderDto) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_CREATE, createDto)
    );
  }

  @Get('work-orders/:id')
  async getWorkOrder(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_GET_BY_ID, id)
    );
  }

  @Put('work-orders/:id')
  async updateWorkOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWorkOrderDto,
  ) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.WORK_ORDER_UPDATE, { id, updateDto })
    );
  }

  // Batches
  @Get('batches')
  async getBatches() {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_LIST, {})
    );
  }

  @Post('batches')
  async createBatch(@Body() createDto: CreateBatchDto) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_CREATE, createDto)
    );
  }

  @Get('batches/:id')
  async getBatch(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_GET_BY_ID, id)
    );
  }

  @Post('batches/:id/start')
  async startBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() startDto: StartBatchDto,
  ) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_START, { id, startDto })
    );
  }

  @Post('batches/:id/consume-material')
  async consumeMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() consumeDto: ConsumeMaterialDto,
  ) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_CREATE, {
        batchId: id,
        consumeDto,
      })
    );
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
    
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_STEP_EXECUTE, {
        batchId: id,
        stepId: step.id,
        executeDto,
      })
    );
  }

  @Post('batches/:id/complete')
  async completeBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() completeDto: CompleteBatchDto,
  ) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_COMPLETE, { id, completeDto })
    );
  }

  @Post('batches/:id/submit-to-qc')
  async submitBatchToQC(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitDto: SubmitBatchToQCDto,
  ) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_SUBMIT_TO_QC, { id, submitDto })
    );
  }

  @Post('batches/:id/receive-finished-goods')
  async receiveFinishedGoods(
    @Param('id', ParseIntPipe) id: number,
    @Body() receiveDto: ReceiveFinishedGoodsDto,
  ) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_RECEIVE_FINISHED_GOODS, {
        id,
        receiveDto,
      })
    );
  }

  // Batch Steps
  @Get('batches/:id/steps')
  async getBatchSteps(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_STEP_GET_BY_BATCH, id)
    );
  }

  // Material Consumption
  @Get('batches/:id/material-consumption')
  async getMaterialConsumption(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_GET_BY_BATCH, id)
    );
  }
}

