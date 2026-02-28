import { Controller, Get, Post, Body, Param, Query, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateBatchDto,
  StartBatchDto,
  CompleteBatchDto,
  SubmitBatchToQCDto,
  ReceiveFinishedGoodsDto,
  ConsumeMaterialDto,
  ExecuteBatchStepDto,
  MANUFACTURING_PATTERNS,
  BatchStatus,
} from '@repo/shared';

@Controller('manufacturing/batches')
export class BatchesController {
  constructor(
    @Inject('MANUFACTURING_SERVICE')
    private manufacturingClient: ClientProxy,
  ) {}

  @Get()
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
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_LIST, params),
    );
    return { success: true, data: result };
  }

  @Post()
  async createBatch(@Body() createDto: CreateBatchDto) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_CREATE, createDto),
    );
    return { success: true, data: result };
  }

  @Get(':id')
  async getBatch(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_GET_BY_ID, id),
    );
    return { success: true, data: result };
  }

  @Post(':id/start')
  async startBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() startDto: StartBatchDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_START, { id, startDto }),
    );
    return { success: true, data: result };
  }

  @Post(':id/consume-material')
  async consumeMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() consumeDto: ConsumeMaterialDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_CREATE, {
        batchId: id,
        consumeDto,
      }),
    );
    return { success: true, data: result };
  }

  @Post(':id/execute-step')
  async executeBatchStep(
    @Param('id', ParseIntPipe) id: number,
    @Body() executeDto: ExecuteBatchStepDto,
  ) {
    const step = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_STEP_CREATE, {
        batchId: id,
        createDto: executeDto,
      }),
    );
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_STEP_EXECUTE, {
        batchId: id,
        stepId: step.id,
        executeDto,
      }),
    );
    return { success: true, data: result };
  }

  @Post(':id/complete')
  async completeBatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() completeDto: CompleteBatchDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_COMPLETE, { id, completeDto }),
    );
    return { success: true, data: result };
  }

  @Post(':id/submit-to-qc')
  async submitBatchToQC(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitDto: SubmitBatchToQCDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_SUBMIT_TO_QC, { id, submitDto }),
    );
    return { success: true, data: result };
  }

  @Post(':id/receive-finished-goods')
  async receiveFinishedGoods(
    @Param('id', ParseIntPipe) id: number,
    @Body() receiveDto: ReceiveFinishedGoodsDto,
  ) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_RECEIVE_FINISHED_GOODS, {
        id,
        receiveDto,
      }),
    );
    return { success: true, data: result };
  }

  @Get(':id/steps')
  async getBatchSteps(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.BATCH_STEP_GET_BY_BATCH, id),
    );
    return { success: true, data: result };
  }

  @Get(':id/material-consumption')
  async getMaterialConsumptionByBatch(@Param('id', ParseIntPipe) id: number) {
    const result = await firstValueFrom(
      this.manufacturingClient.send(MANUFACTURING_PATTERNS.MATERIAL_CONSUMPTION_GET_BY_BATCH, id),
    );
    return { success: true, data: result };
  }
}
