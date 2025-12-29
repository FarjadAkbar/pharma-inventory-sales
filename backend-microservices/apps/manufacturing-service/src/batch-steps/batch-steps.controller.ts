import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BatchStepsService } from './batch-steps.service';
import {
  MANUFACTURING_PATTERNS,
  ExecuteBatchStepDto,
} from '@repo/shared';

@Controller()
export class BatchStepsController {
  constructor(private readonly batchStepsService: BatchStepsService) {}

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_STEP_CREATE)
  create(@Payload() data: { batchId: number; createDto: ExecuteBatchStepDto }) {
    return this.batchStepsService.create(data.batchId, data.createDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_STEP_EXECUTE)
  execute(@Payload() data: { batchId: number; stepId: number; executeDto: ExecuteBatchStepDto }) {
    return this.batchStepsService.execute(data.batchId, data.stepId, data.executeDto);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_STEP_GET_BY_BATCH)
  findByBatch(@Payload() batchId: number) {
    return this.batchStepsService.findAll(batchId);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_STEP_GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.batchStepsService.findOne(id);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.BATCH_STEP_UPDATE)
  update(@Payload() data: { id: number; updateDto: Partial<ExecuteBatchStepDto> }) {
    return this.batchStepsService.update(data.id, data.updateDto);
  }
}

