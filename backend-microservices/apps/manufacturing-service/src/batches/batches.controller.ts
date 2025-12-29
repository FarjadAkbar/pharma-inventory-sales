import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BatchesService } from './batches.service';
import {
  MANUFACTURING_PATTERNS,
  CreateBatchDto,
  StartBatchDto,
  CompleteBatchDto,
  SubmitBatchToQCDto,
  ReceiveFinishedGoodsDto,
} from '@repo/shared';

@Controller()
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_CREATE)
  create(@Payload() createDto: CreateBatchDto) {
    return this.batchesService.create(createDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_LIST)
  findAll() {
    return this.batchesService.findAll();
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.batchesService.findOne(id);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_GET_BY_WORK_ORDER)
  findByWorkOrder(@Payload() workOrderId: number) {
    return this.batchesService.findByWorkOrder(workOrderId);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_START)
  start(@Payload() data: { id: number; startDto: StartBatchDto }) {
    return this.batchesService.start(data.id, data.startDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_COMPLETE)
  complete(@Payload() data: { id: number; completeDto: CompleteBatchDto }) {
    return this.batchesService.complete(data.id, data.completeDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_SUBMIT_TO_QC)
  submitToQC(@Payload() data: { id: number; submitDto: SubmitBatchToQCDto }) {
    return this.batchesService.submitToQC(data.id, data.submitDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_RECEIVE_FINISHED_GOODS)
  receiveFinishedGoods(@Payload() data: { id: number; receiveDto: ReceiveFinishedGoodsDto }) {
    return this.batchesService.receiveFinishedGoods(data.id, data.receiveDto);
  }
}

