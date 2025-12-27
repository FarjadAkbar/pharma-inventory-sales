import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QAReleasesService } from './qa-releases.service';
import { 
  QA_RELEASE_PATTERNS,
  CreateQAReleaseDto,
  UpdateQAReleaseDto,
  MakeReleaseDecisionDto,
} from '@repo/shared';

@Controller()
export class QAReleasesController {
  constructor(private readonly qaReleasesService: QAReleasesService) {}

  @MessagePattern(QA_RELEASE_PATTERNS.CREATE)
  create(@Payload() createQAReleaseDto: CreateQAReleaseDto) {
    return this.qaReleasesService.create(createQAReleaseDto);
  }

  @MessagePattern(QA_RELEASE_PATTERNS.LIST)
  findAll() {
    return this.qaReleasesService.findAll();
  }

  @MessagePattern(QA_RELEASE_PATTERNS.GET_BY_ID)
  findOne(@Payload() id: number) {
    return this.qaReleasesService.findOne(id);
  }

  @MessagePattern(QA_RELEASE_PATTERNS.GET_BY_SAMPLE)
  findBySample(@Payload() sampleId: number) {
    return this.qaReleasesService.findBySample(sampleId);
  }

  @MessagePattern(QA_RELEASE_PATTERNS.UPDATE)
  update(@Payload() data: { id: number; updateDto: UpdateQAReleaseDto }) {
    return this.qaReleasesService.update(data.id, data.updateDto);
  }

  @MessagePattern(QA_RELEASE_PATTERNS.COMPLETE_CHECKLIST)
  completeChecklist(@Payload() data: { id: number; reviewedBy: number }) {
    return this.qaReleasesService.completeChecklist(data.id, data.reviewedBy);
  }

  @MessagePattern(QA_RELEASE_PATTERNS.MAKE_DECISION)
  makeDecision(@Payload() data: { id: number; makeDecisionDto: MakeReleaseDecisionDto }) {
    return this.qaReleasesService.makeDecision(data.id, data.makeDecisionDto);
  }

  @MessagePattern(QA_RELEASE_PATTERNS.NOTIFY_WAREHOUSE)
  notifyWarehouse(@Payload() id: number) {
    return this.qaReleasesService.notifyWarehouse(id);
  }

  @MessagePattern(QA_RELEASE_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.qaReleasesService.delete(id);
  }
}

