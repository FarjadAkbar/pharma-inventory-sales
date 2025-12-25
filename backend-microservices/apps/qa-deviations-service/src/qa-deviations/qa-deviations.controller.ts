import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QADeviationsService } from './qa-deviations.service';
import { 
  QA_DEVIATION_PATTERNS,
  CreateQADeviationDto,
  UpdateQADeviationDto,
  DeviationStatus,
} from '@repo/shared';

@Controller()
export class QADeviationsController {
  constructor(private readonly qaDeviationsService: QADeviationsService) {}

  @MessagePattern(QA_DEVIATION_PATTERNS.CREATE)
  create(@Payload() createQADeviationDto: CreateQADeviationDto) {
    return this.qaDeviationsService.create(createQADeviationDto);
  }

  @MessagePattern(QA_DEVIATION_PATTERNS.LIST)
  findAll() {
    return this.qaDeviationsService.findAll();
  }

  @MessagePattern(QA_DEVIATION_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.qaDeviationsService.findOne(id);
  }

  @MessagePattern(QA_DEVIATION_PATTERNS.GET_BY_SOURCE)
  findBySource(@Payload() data: { sourceType: string; sourceId: number }) {
    return this.qaDeviationsService.findBySource(data.sourceType, data.sourceId);
  }

  @MessagePattern(QA_DEVIATION_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateQADeviationDto }) {
    return this.qaDeviationsService.update(data.id, data.updateDto);
  }

  @MessagePattern(QA_DEVIATION_PATTERNS.ASSIGN)
  assign(@Payload() data: { id: number; assignedTo: number }) {
    return this.qaDeviationsService.assign(data.id, data.assignedTo);
  }

  @MessagePattern(QA_DEVIATION_PATTERNS.UPDATE_STATUS)
  updateStatus(@Payload() data: { id: number; status: DeviationStatus }) {
    return this.qaDeviationsService.updateStatus(data.id, data.status);
  }

  @MessagePattern(QA_DEVIATION_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.qaDeviationsService.delete(id);
  }
}

