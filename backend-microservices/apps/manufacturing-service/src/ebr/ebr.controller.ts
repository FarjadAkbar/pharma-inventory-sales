import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EBRService } from './ebr.service';
import { MANUFACTURING_PATTERNS } from '@repo/shared';

@Controller()
export class EBRController {
  constructor(private readonly ebrService: EBRService) {}

  @MessagePattern(MANUFACTURING_PATTERNS.EBR_GET_BY_BATCH)
  getByBatch(@Payload() batchId: number) {
    return this.ebrService.getEBRByBatchId(batchId);
  }

  @MessagePattern(MANUFACTURING_PATTERNS.EBR_LIST)
  list(@Payload() params?: {
    batchId?: number;
    drugId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return this.ebrService.getEBRs(params);
  }
}

